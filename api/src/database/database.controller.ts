import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common'
import { Request } from 'express'
import { DatabaseService } from './database.service'
import { ProjectService } from '../project/project.service'
import { AccountAuthGuard } from '../authorization/account.guard'
import { ProjectGuard } from '../project/project.guard'

@Controller('database')
@UseGuards(AccountAuthGuard, ProjectGuard)
export class DatabaseController {
	constructor(
    private readonly databaseService: DatabaseService,
    private readonly projectService: ProjectService
	) {}

  @Get('tables')
	async collections(@Req() req: Request & { projectId: string }): Promise<any> {
		const projectId = req.projectId
		const tables = await this.databaseService.getTablesMetadata(projectId)
		return { collections: tables }
	}

  @Get('fetch')
  async fetch(@Query() queryParams: any, @Req() req: Request & { projectId: string }): Promise<any> {
  	const projectId = req.projectId
  	const { collection, doc, association } = this.databaseService.prepare(queryParams)
  	
  	return await this.databaseService.fetch(projectId, collection, {}, association, doc)
  }
}
