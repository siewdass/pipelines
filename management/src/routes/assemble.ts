import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'
import { config } from '../config'

export const assembleRouter: RouterType = Router()

let mistralClient: OpenAI | null = null
let groqClient: OpenAI | null = null
let provider: 'mistral' | 'groq' = 'mistral'

if (config.mistralApiKey) {
	mistralClient = new OpenAI({
		apiKey: config.mistralApiKey,
		baseURL: 'https://api.mistral.ai/v1'
	})
}

if (config.groqApiKey) {
	groqClient = new OpenAI({
		apiKey: config.groqApiKey,
		baseURL: 'https://api.groq.com/openai/v1'
	})
}

if (config.mistralApiKey && mistralClient) {
	provider = 'mistral'
} else if (groqClient) {
	provider = 'groq'
}

assembleRouter.get('/prompts/:projectId', async (req, res) => {
	try {
		const { projectId } = req.params
		const { db } = await getContext(projectId)
		const prompts = db.collection('assemble_prompts')
		const list = await prompts.find({ projectId }).sort({ createdAt: -1 }).limit(10).toArray()
		res.json(list)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

assembleRouter.post('/prompts', async (req, res) => {
	try {
		const { prompt, projectId, basedOnSourceId } = req.body
		if (!mistralClient && !groqClient) {
			res.status(500).json({ error: 'No AI client is initialized' })
			return
		}

		const { db } = await getContext(projectId)
		const prompts = db.collection('assemble_prompts')
		const sources = db.collection('sources')

		await prompts.insertOne({
			_id: uuidv4(),
			projectId,
			role: 'user',
			content: prompt,
			createdAt: new Date(),
		} as any)

		const schemas = await db.collection('schemas').find().toArray()

		let existingCode = 'No existing React code yet.'
		if (basedOnSourceId) {
			const source = await sources.findOne({ _id: basedOnSourceId, projectId })
			if (source) existingCode = source.code
		} else {
			const latest = await sources.findOne({ projectId }, { sort: { createdAt: -1 } })
			if (latest) existingCode = latest.code
		}

		const systemPrompt = `
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

		const historyPrompts = await prompts
			.find({ projectId })
			.sort({ createdAt: -1 })
			.limit(11)
			.toArray()

		const historyMessages = historyPrompts
			.reverse()
			.slice(0, -1)
			.map((p: any) => ({
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
						message: { type: 'string', description: 'Friendly message describing changes' },
						code: { type: 'string', description: 'Complete updated JSX code' },
						features: {
							type: 'array',
							description: 'Hierarchical catalog of sections with features',
							items: {
								type: 'object',
								properties: {
									name: { type: 'string', description: 'Section name' },
									features: {
										type: 'array',
										items: {
											type: 'object',
											properties: {
												name: { type: 'string', description: 'Feature name' },
												description: { type: 'string', description: 'Feature description' }
											},
											required: [ 'name', 'description' ]
										}
									}
								},
								required: [ 'name' ]
							}
						}
					},
					required: [ 'message', 'code', 'features' ]
				}
			}
		}

		let parsedResponse: { message: string; code: string; features: any[] } | null = null

		const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: 'system', content: systemPrompt },
			...historyMessages,
			{ role: 'user', content: prompt }
		]

		if (provider === 'mistral' && mistralClient) {
			try {
				const response = await mistralClient.chat.completions.create({
					model: 'mistral-small-latest',
					messages,
					temperature: 0.7,
					tools: [ toolSchema ],
					tool_choice: 'required',
				})
				const toolCall = response.choices[0]?.message?.tool_calls?.[0]
				if (toolCall?.function?.name === 'update_code') {
					parsedResponse = JSON.parse(toolCall.function.arguments)
				}
			} catch (e: any) {
				console.error('[Assemble] Mistral error:', e.message)
			}
		}

		if (!parsedResponse && groqClient) {
			try {
				const response = await groqClient.chat.completions.create({
					model: 'llama-3.3-70b-versatile',
					messages,
					temperature: 0.7,
					tools: [ toolSchema ],
					tool_choice: 'required',
				})
				const toolCall = response.choices[0]?.message?.tool_calls?.[0]
				if (toolCall?.function?.name === 'update_code') {
					parsedResponse = JSON.parse(toolCall.function.arguments)
				}
			} catch (e: any) {
				console.error('[Assemble] Groq error:', e.message)
			}
		}

		if (!parsedResponse) {
			res.status(500).json({ error: 'AI returned an invalid response' })
			return
		}

		await prompts.insertOne({
			_id: uuidv4(),
			projectId,
			role: 'model',
			content: parsedResponse.message,
			createdAt: new Date(),
		} as any)

		const builds = db.collection('builds')
		const sourceCount = await sources.countDocuments({ projectId })

		const sourceId = uuidv4()
		await sources.insertOne({
			_id: sourceId,
			projectId,
			basedOn: basedOnSourceId || null,
			code: parsedResponse.code,
			features: parsedResponse.features || [],
			createdAt: new Date(),
		} as any)

		if (sourceCount === 0) {
			const esbuild = await import('esbuild')
			const compiled = await esbuild.transform(parsedResponse.code, {
				loader: 'jsx',
				jsx: 'transform',
				jsxFactory: 'React.createElement',
				jsxFragment: 'React.Fragment',
				format: 'iife'
			})

			await builds.updateOne(
				{ projectId },
				{ $set: { sourceId, code: compiled.code, updatedAt: new Date() } },
				{ upsert: true }
			)
		}

		res.json({ response: parsedResponse.message, features: parsedResponse.features || [] })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

assembleRouter.get('/features/:projectId', async (req, res) => {
	try {
		const { projectId } = req.params
		const { sourceId } = req.query
		const { db } = await getContext(projectId)
		const sources = db.collection('sources')

		let source
		if (sourceId) {
			source = await sources.findOne({ _id: sourceId, projectId })
		} else {
			source = await sources.findOne({ projectId }, { sort: { createdAt: -1 } })
		}

		res.json({ features: source?.features || [] })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

assembleRouter.post('/compile/:projectId', async (req, res) => {
	try {
		const { projectId } = req.params
		const { sourceId } = req.body
		const { db } = await getContext(projectId)
		const sources = db.collection('sources')
		const builds = db.collection('builds')

		let resolvedId = sourceId
		if (!resolvedId) {
			const latest = await sources.findOne({ projectId }, { sort: { createdAt: -1 } })
			if (latest) resolvedId = latest._id
		}

		if (!resolvedId) {
			res.status(404).json({ error: 'No source found for this project' })
			return
		}

		const source = await sources.findOne({ _id: resolvedId, projectId })
		if (!source) {
			res.status(404).json({ error: 'Source not found' })
			return
		}

		const esbuild = await import('esbuild')
		const result = await esbuild.transform(source.code, {
			loader: 'jsx',
			jsx: 'transform',
			jsxFactory: 'React.createElement',
			jsxFragment: 'React.Fragment',
			format: 'iife'
		})

		await builds.updateOne(
			{ projectId },
			{ $set: { sourceId: resolvedId, code: result.code, updatedAt: new Date() } },
			{ upsert: true }
		)

		res.json({ code: result.code })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})
