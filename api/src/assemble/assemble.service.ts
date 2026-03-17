import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ProjectService } from '../project/project.service'
import { clc } from '../utils/colors'
import { REACT_SKILLS_PROMPT } from './assemble.prompts'

@Injectable()
export class AssembleService {
	private readonly logger = new Logger(AssembleService.name)
	private genAI: GoogleGenerativeAI

	constructor(
		private configService: ConfigService,
		private projectService: ProjectService
	) {
		const apiKey = this.configService.get<string>('GEMINI_API_KEY')
		if (apiKey) {
			this.genAI = new GoogleGenerativeAI(apiKey)
			this.logger.log(`${clc.green('Gemini AI initialized')}`)
		} else {
			this.logger.warn(`${clc.red('GEMINI_API_KEY is not defined')} in environment variables. Gemini features will be disabled.`)
		}
	}

	async generateText(prompt: string, projectId: string): Promise<string> {
		if (!this.genAI) {
			throw new Error('Gemini AI is not initialized. Please provide GEMINI_API_KEY in .env')
		}

		// Initialize model with system instructions for the specific request
		const model = this.genAI.getGenerativeModel({ 
			model: 'gemini-1.5-flash',
			systemInstruction: REACT_SKILLS_PROMPT
		})

		try {
			// Get project context to fetch schemas and provide more context to Gemini
			const { db } = await this.projectService.getProjectContext(projectId)
			const schemas = await db.collection('schemas').find().toArray()
			
			const contextPrompt = `
				Project ID: ${projectId}
				Database Schema:
				${JSON.stringify(schemas, null, 2)}

				User Request: ${prompt}
			`

			this.logger.log(`Generating context-aware content for project: ${clc.yellow(projectId)}`)
			const result = await model.generateContent(contextPrompt)
			const response = await result.response
			return response.text()
		} catch (error) {
			this.logger.error(`${clc.red('Error generating content from Gemini:')} ${error.message}`)
			throw error
		}
	}
}
