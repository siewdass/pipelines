import { Controller, Post, Body, Logger, HttpException, HttpStatus, Get, Param } from '@nestjs/common'
import { AssembleService } from './assemble.service'

@Controller('assemble')
export class AssembleController {
	private readonly logger = new Logger(AssembleController.name)

	constructor(private readonly assembleService: AssembleService) {}

	@Get('prompts/:projectId')
	async getPrompts(@Param('projectId') projectId: string) {
		return this.assembleService.getPrompts(projectId)
	}

	@Post('prompts')
	async generatePrompt(
		@Body('prompt') prompt: string,
		@Body('projectId') projectId: string
	) {
		this.logger.log(`Received generation request for project: ${projectId}`)
		this.logger.log(`Prompt: ${prompt?.substring(0, 50)}...`)
		const response = await this.assembleService.generatePrompt(projectId, prompt)
		const config = await this.assembleService.getConfig(projectId)
		return { response, features: config?.features || [] }
	}

	@Get('features/:projectId')
	async getFeatures(@Param('projectId') projectId: string) {
		const config = await this.assembleService.getConfig(projectId)
		return { features: config?.features || [] }
	}

	@Post('compile/:projectId')
	async compileProject(@Param('projectId') projectId: string) {
		this.logger.log(`Received compile request for project ${projectId}`)
		
		const config = await this.assembleService.getConfig(projectId)
		if (!config || !config.source) {
			throw new HttpException('No hay código fuente ("source") guardado para compilar', HttpStatus.NOT_FOUND)
		}
		
		const build = await this.assembleService.compileReactCode(config.source)
		
		// Guardando el nuevo build en la BD antes de responder
		config.build = build
		await config.save()

		return { build }
	}
}
