import { Controller, Get, Delete, Param, Logger } from '@nestjs/common'
import { SourceService } from './source.service'

@Controller('source')
export class SourceController {
	private readonly logger = new Logger(SourceController.name)

	constructor(private readonly sourceService: SourceService) {}

	@Get(':projectId')
	async list(@Param('projectId') projectId: string) {
		return this.sourceService.list(projectId)
	}

	@Get(':projectId/:sourceId')
	async getById(@Param('projectId') projectId: string, @Param('sourceId') sourceId: string) {
		return this.sourceService.getById(projectId, sourceId)
	}

	@Delete(':projectId/:sourceId')
	async delete(@Param('projectId') projectId: string, @Param('sourceId') sourceId: string) {
		return this.sourceService.delete(projectId, sourceId)
	}
}
