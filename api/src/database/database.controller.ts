import { Controller, Get, Query, UseGuards, Req, Logger } from '@nestjs/common'
import { clc } from '../utils/colors'
import { Request } from 'express'
import { DatabaseService } from './database.service'
import { ProjectService } from '../project/project.service'
import { AccountAuthGuard } from '../authorization/account.guard'
import { ProjectGuard } from '../project/project.guard'

@Controller('database')
@UseGuards(AccountAuthGuard, ProjectGuard)
export class DatabaseController {
	private readonly logger = new Logger(DatabaseController.name)

	constructor(
    private readonly databaseService: DatabaseService,
    private readonly projectService: ProjectService
	) {}

  @Get('tables')
	async collections(@Req() req: Request & { projectId: string }): Promise<any> {
		const projectId = req.projectId
		this.logger.log(`${clc.cyan('Fetching tables for:')} ${clc.magenta(projectId)}`)
		const tables = await this.databaseService.getTablesMetadata(projectId)
		return { collections: tables }
	}

  @Get('fetch')
  async fetch(@Query() queryParams: any, @Req() req: Request & { projectId: string }): Promise<any> {
  	const projectId = req.projectId
  	const { collection, doc, association } = this.databaseService.prepare(queryParams)
  	
		this.logger.log(`${clc.cyan('Fetch collection:')} ${clc.yellow(collection)} ${clc.gray(`(Project: ${projectId})`)}`)
  	return await this.databaseService.fetch(projectId, collection, {}, association, doc)
  }
}
