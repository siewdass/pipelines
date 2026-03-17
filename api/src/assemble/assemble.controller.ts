import { Controller, Post, Body, Logger } from '@nestjs/common'
import { AssembleService } from './assemble.service'
import { clc } from '../utils/colors'

@Controller('assemble')
export class AssembleController {
	private readonly logger = new Logger(AssembleController.name)

	constructor(private readonly assembleService: AssembleService) {}

	@Post('generate')
	async generate(
		@Body('prompt') prompt: string,
		@Body('projectId') projectId: string
	) {
		this.logger.log(`Received generation request for project: ${clc.yellow(projectId)}`)
		this.logger.log(`Prompt: ${clc.cyan(prompt?.substring(0, 50))}...`)
		const response = await this.assembleService.generateText(prompt, projectId)
		return { response }
	}
}
