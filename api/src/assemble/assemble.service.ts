import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as esbuild from 'esbuild'
import { GoogleGenerativeAI, Content, SchemaType } from '@google/generative-ai'
import { ProjectService } from '../project/project.service'
import { AssembleConfig } from './config.schema'
import { AssemblePrompt } from './prompt.schema'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { REACT_SKILLS_PROMPT } from './assemble.prompts'

@Injectable()
export class AssembleService {
	private readonly logger = new Logger(AssembleService.name)
	private genAI: GoogleGenerativeAI

	constructor(
		private configService: ConfigService,
		private projectService: ProjectService,
		@InjectModel(AssembleConfig.name, 'default') private assembleConfigModel: Model<AssembleConfig>,
		@InjectModel(AssemblePrompt.name, 'default') private assemblePromptModel: Model<AssemblePrompt>
	) {
		const apiKey = this.configService.get<string>('GEMINI_API_KEY')
		if (apiKey) {
			this.genAI = new GoogleGenerativeAI(apiKey)
			this.logger.log('Gemini AI initialized')
		} else {
			this.logger.warn('GEMINI_API_KEY is not defined in environment variables. Gemini features will be disabled.')
		}
	}

	async getPrompts(projectId: string) {
		return this.assemblePromptModel.find({ projectId }).sort({ createdAt: 1 })
	}

	async generatePrompt(projectId: string, message: string): Promise<string> {
		if (!this.genAI) {
			throw new Error('Gemini AI is not initialized. Please provide GEMINI_API_KEY in .env')
		}

		await new this.assemblePromptModel({ projectId, role: 'user', content: message }).save()

		try {
			const { db } = await this.projectService.getProjectContext(projectId)
			const schemas = await db.collection('schemas').find().toArray()
			
			const existingConfig = await this.assembleConfigModel.findOne({ projectId })
			const existingSource = existingConfig?.source || 'No existing React code yet.'

			const systemInstruction = `
				${REACT_SKILLS_PROMPT}

				Database Schema:
				${JSON.stringify(schemas, null, 2)}

				----- CURRENT EXISTING CODE -----
				Source Code (JSX):
				${existingSource}
				---------------------------------

				CRITICAL: Follow the exact JSON schema provided in the generation config.
			`

			const model = this.genAI.getGenerativeModel({
				model: 'gemini-3-flash-preview',
				systemInstruction,
				generationConfig: {
					responseMimeType: 'application/json',
					responseSchema: {
						type: SchemaType.OBJECT,
						properties: {
							message: {
								type: SchemaType.STRING,
								description: 'Un mensaje amigable y conversacional en español resumiendo los cambios.'
							},
							code: {
								type: SchemaType.STRING,
								description: 'El código JSX puro y completo actualizado o intacto si no hubo cambios técnicos.'
							},
							features: {
								type: SchemaType.ARRAY,
								description: 'Catálogo jerárquico de todas las secciones y funcionalidades de la aplicación. Todo en español.',
								items: {
									type: SchemaType.OBJECT,
									properties: {
										name: { type: SchemaType.STRING, description: 'Nombre de la sección en español (ej: Gestión de Usuarios, Analíticas)' },
										features: {
											type: SchemaType.ARRAY,
											description: 'Funcionalidades específicas dentro de esta sección.',
											items: {
												type: SchemaType.OBJECT,
												properties: {
													name: { type: SchemaType.STRING, description: 'Nombre de la funcionalidad en español' },
													description: { type: SchemaType.STRING, description: 'Descripción específica en español de lo que hace esta funcionalidad' }
												},
												required: [ 'name', 'description' ]
											}
										}
									},
									required: [ 'name', 'features' ]
								}
							}
						},
						required: [ 'message', 'code', 'features' ]
					}
				}
			})

			const historyPrompts = await this.assemblePromptModel.find({ projectId }).sort({ createdAt: 1 })
			
			const history: Content[] = historyPrompts.slice(0, -1).map(p => ({
				role: p.role === 'user' ? 'user' : 'model',
				parts: [ { text: p.content } ]
			}))

			this.logger.log(`Starting chat session for project: ${projectId}`)
			const chat = model.startChat({ history })
			const result = await chat.sendMessage(message)
			const responseText = result.response.text()

			let parsedResponse: { message: string, code: string, features: { name: string; features: { name: string; description: string }[] }[] }
			try {
				parsedResponse = JSON.parse(responseText)
			} catch {
				this.logger.error('Failed to parse JSON from Gemini:', responseText)
				throw new Error('Gemini failed to return a valid JSON structure.')
			}

			// Guardar solo el mensaje conversacional como registro de chat
			await new this.assemblePromptModel({ projectId, role: 'model', content: parsedResponse.message }).save()
			
			// Actualizar el código fuente con el JSX devuelto en el JSON
			const cleanSource = parsedResponse.code.trim()
			
			if (existingConfig) {
				existingConfig.source = cleanSource
				existingConfig.features = parsedResponse.features || []
				await existingConfig.save()
			} else {
				await new this.assembleConfigModel({ projectId, source: cleanSource, features: parsedResponse.features || [] }).save()
			}
			
			return parsedResponse.message
		} catch (error) {
			this.logger.error(`Error generating content from Gemini: ${error.message}`)
			throw error
		}
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

	async getConfig(projectId: string) {
		return this.assembleConfigModel.findOne({ projectId })
	}
}
