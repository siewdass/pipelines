import { Controller, Post, Body, Logger, HttpException, HttpStatus, Get, Param } from '@nestjs/common'
import { AssembleService } from './assemble.service'
import { SourceService } from '../source/source.service'
import { BuildService } from '../build/build.service'

@Controller('assemble')
export class AssembleController {
	private readonly logger = new Logger(AssembleController.name)

	constructor(
		private readonly assembleService: AssembleService,
		private readonly sourceService: SourceService,
		private readonly buildService: BuildService,
	) {}

	@Get('prompts/:projectId')
	async getPrompts(@Param('projectId') projectId: string) {
		return this.assembleService.getPrompts(projectId)
	}

	@Post('prompts')
	async generatePrompt(
		@Body('prompt') prompt: string,
		@Body('projectId') projectId: string,
		@Body('basedOnSourceId') basedOnSourceId?: string
	) {
		this.logger.log(`Received generation request for project: ${projectId}`)
		this.logger.log(`Prompt: ${prompt?.substring(0, 50)}...`)
		const response = await this.assembleService.generatePrompt(projectId, prompt, basedOnSourceId)
		const build = await this.buildService.get(projectId)
		return { response, features: build?.sourceId ? (await this.sourceService.getById(projectId, build.sourceId.toString())).features : [] }
	}

	@Get('features/:projectId')
	async getFeatures(@Param('projectId') projectId: string) {
		const build = await this.buildService.get(projectId)
		if (build) {
			const source = await this.sourceService.getById(projectId, build.sourceId.toString())
			return { features: source.features || [] }
		}
		return { features: [] }
	}

	@Post('compile/:projectId')
	async compileProject(
		@Param('projectId') projectId: string,
		@Body('sourceId') sourceId: string
	) {
		this.logger.log(`Received compile request for project ${projectId}, source: ${sourceId}`)
		const compiled = await this.assembleService.compile(projectId, sourceId)
		return { code: compiled }
	}
}
