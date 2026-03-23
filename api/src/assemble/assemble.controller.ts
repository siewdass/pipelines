import { Controller, Post, Body, Logger } from '@nestjs/common'
import { AssembleService } from './assemble.service'

@Controller('assemble')
export class AssembleController {
	private readonly logger = new Logger(AssembleController.name)

	constructor(private readonly assembleService: AssembleService) {}

	@Post('generate')
	async generate(
		@Body('prompt') prompt: string,
		@Body('projectId') projectId: string
	) {
		this.logger.log(`Received generation request for project: ${projectId}`)
		this.logger.log(`Prompt: ${prompt?.substring(0, 50)}...`)
		const response = await this.assembleService.generateText(prompt, projectId)
		return { response }
	}
}
