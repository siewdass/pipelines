import { Controller, Get, Query, UseGuards, Req, Logger } from '@nestjs/common'
import type { Request } from 'express'
import { DatabaseService } from './database.service'
import { ProjectGuard } from '../project/project.guard'

@Controller('database')
@UseGuards(ProjectGuard)
export class DatabaseController {
	private readonly logger = new Logger(DatabaseController.name)

	constructor(
    private readonly databaseService: DatabaseService
	) {}

  @Get('tables')
	async collections(@Req() req: Request & { projectId: string }): Promise<any> {
		const { projectId } = req
		
		this.logger.log(`Fetching tables for: ${projectId}`)
		const tables = await this.databaseService.getTablesMetadata(projectId)
		return { collections: tables }
	}

  @Get('fetch')
  async fetch(@Query() queryParams: any, @Req() req: Request & { projectId: string }): Promise<any> {
  	const { projectId } = req

  	const { collection, doc, association } = this.databaseService.prepare(queryParams)
  	
  	this.logger.log(`Fetch collection: ${collection} (Project: ${projectId})`)
  	return await this.databaseService.fetch(projectId, collection, {}, association, doc)
  }
}
