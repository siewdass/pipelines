import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as esbuild from 'esbuild'
import OpenAI from 'openai'
import { ProjectService } from '../project/project.service'
import { SourceService } from '../source/source.service'
import { BuildService } from '../build/build.service'
import { AssemblePrompt } from './prompt.schema'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { REACT_SKILLS_PROMPT } from './assemble.prompts'

@Injectable()
export class AssembleService {
	private readonly logger = new Logger(AssembleService.name)
	private mistralClient: OpenAI
	private groqClient: OpenAI
	private provider: 'mistral' | 'groq'

	constructor(
		private configService: ConfigService,
		private projectService: ProjectService,
		private sourceService: SourceService,
		private buildService: BuildService,
		@InjectModel(AssemblePrompt.name, 'default') private assemblePromptModel: Model<AssemblePrompt>
	) {
		const mistralKey = this.configService.get<string>('MISTRAL_API_KEY')
		const groqKey = this.configService.get<string>('GROQ_API_KEY')

		if (mistralKey) {
			this.mistralClient = new OpenAI({
				apiKey: mistralKey,
				baseURL: 'https://api.mistral.ai/v1'
			})
			this.logger.log('Mistral AI initialized')
		} else {
			this.logger.warn('MISTRAL_API_KEY is not defined.')
		}

		if (groqKey) {
			this.groqClient = new OpenAI({
				apiKey: groqKey,
				baseURL: 'https://api.groq.com/openai/v1'
			})
			this.logger.log('Groq AI initialized')
		} else {
			this.logger.warn('GROQ_API_KEY is not defined.')
		}

		const preferred = this.configService.get<string>('AI_PROVIDER') || 'mistral'
		if (preferred === 'mistral' && this.mistralClient) {
			this.provider = 'mistral'
		} else if (this.groqClient) {
			this.provider = 'groq'
		} else if (this.mistralClient) {
			this.provider = 'mistral'
		} else {
			this.logger.warn('No AI provider available.')
		}
	}

	async getPrompts(projectId: string) {
		return this.assemblePromptModel.aggregate([
			{ $match: { projectId } },
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
			{ $sort: { createdAt: 1 } }
		])
	}

	async generatePrompt(projectId: string, message: string, basedOnSourceId?: string): Promise<string> {
		if (!this.mistralClient && !this.groqClient) {
			throw new Error('No AI client is initialized.')
		}

		await new this.assemblePromptModel({ projectId, role: 'user', content: message }).save()

		try {
			const { db } = await this.projectService.getProjectContext(projectId)
			const schemas = await db.collection('schemas').find().toArray()
			
			let existingCode = 'No existing React code yet.'
			if (basedOnSourceId) {
				const source = await this.sourceService.getById(projectId, basedOnSourceId)
				existingCode = source.code
			} else {
				const latest = await this.sourceService.getLatest(projectId)
				if (latest) existingCode = latest.code
			}

			const systemPrompt = `
				${REACT_SKILLS_PROMPT}

				Database Schema:
				${JSON.stringify(schemas, null, 2)}

				----- CURRENT EXISTING CODE -----
				Source Code (JSX):
				${existingCode}
				---------------------------------
				IMPORTANT: The existing code above is outdated. Replace it entirely. Do NOT copy its style.
				Your "code" field MUST be a complete React application in valid JSX. Follow this EXACT pattern:
				---
				const MyComponent = () => {
				  const [state, setState] = React.useState(null)
				  return (
				    <div className="...">
				      <input className="..." placeholder="..." />
				      <button onClick={() => {}} />
				    </div>
				  )
				}
				const App = () => <MyComponent />
				window.Bootstrap(App)
				---
				CRITICAL JSX rules:
				- Self-closing tags MUST end with "/>": <input />, <br />, <hr />, <img />, <textarea />
				- Use "className" NEVER "class"
				- Use "htmlFor" NEVER "for"
				- Use "onClick", "onChange" NEVER "onclick", "onchange"
				- Define at least one named component function (const X = () => (...))
				- Call window.Bootstrap(App) at the very end
				- Tags must be properly nested

				Use the update_code tool to return the updated code and features.
			`

			const historyPrompts = await this.assemblePromptModel
				.find({ projectId })
				.sort({ createdAt: -1 })
				.limit(11)
			
			const historyMessages = historyPrompts
				.reverse()
				.slice(0, -1)
				.map(p => ({
					role: p.role === 'model' ? 'assistant' as const : p.role as 'user' | 'assistant',
					content: p.content
				}))

			const toolSchema: OpenAI.Chat.ChatCompletionTool = {
				type: 'function',
				function: {
					name: 'update_code',
					description: 'Update the React application source code and features catalog',
					parameters: {
						type: 'object',
						properties: {
							message: { type: 'string', description: 'Un mensaje amigable y conversacional en español describiendo solo las mejoras y cambios funcionales realizados. NUNCA menciones convenciones de código, formatos, o cómo seguiste las instrucciones.' },
							code: { type: 'string', description: 'El código JSX puro y completo actualizado' },
							features: {
								type: 'array',
								description: 'Catálogo jerárquico de secciones con funcionalidades.',
								items: {
									type: 'object',
									properties: {
										name: { type: 'string', description: 'Nombre de la sección en español' },
										features: {
											type: 'array',
											items: {
												type: 'object',
												properties: {
													name: { type: 'string', description: 'Nombre de la funcionalidad' },
													description: { type: 'string', description: 'Descripción en español' }
												},
												required: ['name', 'description']
											}
										}
									},
									required: ['name']
								}
							}
						},
						required: ['message', 'code', 'features']
					}
				}
			}

			let parsedResponse: { message: string; code: string; features: { name: string; features: { name: string; description: string }[] }[] } | null = null

			// Try Mistral first
			if (this.provider === 'mistral' && this.mistralClient) {
				this.logger.log(`Starting Mistral session for project: ${projectId}`)
				try {
					parsedResponse = await this.callMistral(systemPrompt, historyMessages, message, toolSchema)
				} catch (e: any) {
					this.logger.error(`Mistral failed: ${e.message}. Falling back to Groq.`)
				}
			}

			// Fallback to Groq
			if (!parsedResponse && this.groqClient) {
				this.logger.log(`Starting Groq session for project: ${projectId}`)
				parsedResponse = await this.callGroq(systemPrompt, historyMessages, message, toolSchema)
			}

			if (!parsedResponse) throw new Error('AI returned an invalid JSON response.')
			if (typeof parsedResponse.code !== 'string') {
				throw new Error(`Expected 'code' to be a string, got ${typeof parsedResponse.code}. Response: ${JSON.stringify(parsedResponse).slice(0, 200)}`)
			}
			if (typeof parsedResponse.message !== 'string') {
				throw new Error(`Expected 'message' to be a string, got ${typeof parsedResponse.message}`)
			}
			if (!Array.isArray(parsedResponse.features)) {
				parsedResponse.features = []
			}

			const rawFeatures: any[] = parsedResponse.features as any[]
			let features = rawFeatures
			if (rawFeatures.length && !('features' in rawFeatures[0])) {
				features = [{ name: 'General', features: rawFeatures }]
			}

			await new this.assemblePromptModel({ projectId, role: 'model', content: parsedResponse.message }).save()
			
			const cleanSource = parsedResponse.code.trim()
			this.logger.log(`Code from AI: ${cleanSource.length} chars`)
			
			const source = await this.sourceService.create({
				projectId,
				basedOn: basedOnSourceId || undefined,
				code: cleanSource,
				features,
			})
			
			return parsedResponse.message
		} catch (error) {
			this.logger.error(`Error generating AI content: ${error.message}`)
			throw error
		}
	}

	private async callMistral(
		systemPrompt: string,
		history: { role: 'user' | 'assistant'; content: string }[],
		userMessage: string,
		toolSchema: OpenAI.Chat.ChatCompletionTool
	): Promise<{ message: string; code: string; features: any[] }> {
		const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: 'system', content: systemPrompt },
			...history,
			{ role: 'user', content: userMessage }
		]

		return this.callOpenAIWithTool(this.mistralClient, 'mistral-large-latest', messages, toolSchema)
	}

	private async callGroq(
		systemPrompt: string,
		history: { role: 'user' | 'assistant'; content: string }[],
		userMessage: string,
		toolSchema: OpenAI.Chat.ChatCompletionTool
	): Promise<{ message: string; code: string; features: any[] }> {
		const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: 'system', content: systemPrompt },
			...history,
			{ role: 'user', content: userMessage }
		]

		return this.callOpenAIWithTool(this.groqClient, 'llama-3.3-70b-versatile', messages, toolSchema)
	}

	private async callOpenAIWithTool(
		client: OpenAI,
		model: string,
		messages: OpenAI.Chat.ChatCompletionMessageParam[],
		toolSchema: OpenAI.Chat.ChatCompletionTool
	): Promise<{ message: string; code: string; features: any[] }> {
		let parsedResponse: { message: string; code: string; features: any[] } | null = null
		for (let attempt = 0; attempt < 3; attempt++) {
			try {
				const response = await client.chat.completions.create({
					model,
					messages,
					temperature: 0.7,
					tools: [toolSchema],
					tool_choice: 'required',
				})
				const toolCall = response.choices[0]?.message?.tool_calls?.[0]
				if (toolCall?.function?.name === 'update_code') {
					parsedResponse = JSON.parse(toolCall.function.arguments)
					break
				}
				throw new Error('Model did not call update_code tool')
			} catch (e: any) {
				if (e?.status === 429 && attempt < 2) {
					const delay = (attempt + 1) * 5000
					this.logger.warn(`Rate limited (attempt ${attempt + 1}), retrying in ${delay}ms...`)
					await new Promise(r => setTimeout(r, delay))
					continue
				}
				throw e
			}
		}
		if (!parsedResponse) throw new Error('AI returned an invalid JSON response.')
		return parsedResponse
	}

	async compileReactCode(jsxCode: string): Promise<string> {
		this.logger.log('Compiling JSX code snippet...')
		try {
			const result = await esbuild.transform(jsxCode, {
				loader: 'jsx',
				jsx: 'transform',
				jsxFactory: 'React.createElement',
				jsxFragment: 'React.Fragment',
				format: 'iife'
			})
			return result.code
		} catch (error) {
			this.logger.error(`Compilation error: ${error.message}`)
			throw error
		}
	}

	async compile(projectId: string, sourceId?: string) {
		const latest = await this.sourceService.getLatest(projectId)
		const resolvedId = sourceId || latest?._id || ''
		if (!resolvedId) throw new Error('No source found for this project. Generate code first.')
		const source = await this.sourceService.getById(projectId, resolvedId)
		const compiled = await this.compileReactCode(source.code)
		await this.buildService.upsert(projectId, resolvedId, compiled)
		return compiled
	}
}
