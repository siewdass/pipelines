import { Controller, Get, Query, UseGuards, Req, Logger, BadRequestException } from '@nestjs/common'
import type { Request } from 'express'
import { DatabaseService } from './database.service'
import { ProjectService } from '../project/project.service'
import { AccountAuthGuard } from '../authorization/account.guard'

@Controller('database')
@UseGuards(AccountAuthGuard)
export class DatabaseController {
	private readonly logger = new Logger(DatabaseController.name)

	constructor(
    private readonly databaseService: DatabaseService,
    private readonly projectService: ProjectService
	) {}

  @Get('tables')
	async collections(@Req() req: Request): Promise<any> {
		const projectId = req.headers['x-project-id'] as string
		if (!projectId) throw new BadRequestException('Missing x-project-id header')
		
		this.logger.log(`Fetching tables for: ${projectId}`)
		const tables = await this.databaseService.getTablesMetadata(projectId)
		return { collections: tables }
	}

  @Get('fetch')
  async fetch(@Query() queryParams: any, @Req() req: Request): Promise<any> {
  	const projectId = req.headers['x-project-id'] as string
  	if (!projectId) throw new BadRequestException('Missing x-project-id header')

  	const { collection, doc, association } = this.databaseService.prepare(queryParams)
  	
  	this.logger.log(`Fetch collection: ${collection} (Project: ${projectId})`)
  	return await this.databaseService.fetch(projectId, collection, {}, association, doc)
  }
}
