import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { ProjectService } from '../project/project.service'
import { clc } from '../utils/colors'

@Injectable()
export class AssembleService {
	private readonly logger = new Logger(AssembleService.name)
	private genAI: GoogleGenerativeAI
	private model: GenerativeModel

	constructor(
		private configService: ConfigService,
		private projectService: ProjectService
	) {
		const apiKey = this.configService.get<string>('GEMINI_API_KEY')
		if (apiKey) {
			this.genAI = new GoogleGenerativeAI(apiKey)
			this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
			this.logger.log(`${clc.green('Gemini AI initialized')} with model ${clc.yellow('gemini-1.5-flash')}`)
		} else {
			this.logger.warn(`${clc.red('GEMINI_API_KEY is not defined')} in environment variables. Gemini features will be disabled.`)
		}
	}

	async generateText(prompt: string, projectId: string): Promise<string> {
		if (!this.model) {
			throw new Error('Gemini AI is not initialized. Please provide GEMINI_API_KEY in .env')
		}

		try {
			// Get project context to fetch schemas and provide more context to Gemini
			const { db } = await this.projectService.getProjectContext(projectId)
			const schemas = await db.collection('schemas').find().toArray()
			
			const contextPrompt = `
				You are an assistant for a data pipeline application.
				The user is working on project ID: ${projectId}.
				The current database schema for this project is:
				${JSON.stringify(schemas, null, 2)}

				User Question: ${prompt}
			`

			this.logger.log(`Generating context-aware content for project: ${clc.yellow(projectId)}`)
			const result = await this.model.generateContent(contextPrompt)
			const response = await result.response
			return response.text()
		} catch (error) {
			this.logger.error(`${clc.red('Error generating content from Gemini:')} ${error.message}`)
			throw error
		}
	}
}
