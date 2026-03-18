import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common'
import { Request } from 'express'
import { InquiryRequestDto, InquiryResponseDto } from './inquiry.dto'
import { ProjectService } from '../project/project.service'
import { InquiryService } from './inquiry.service'
import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { RetrieveRequestDoc, RetrieveResponseDoc } from './inquiry.doc'
import { UserAuthGuard } from '../authorization/user.guard'
import { ProjectGuard } from '../project/project.guard'
import { SourceGuard } from '../authorization/source.guard'
import { clc } from '../utils/colors'

@Controller('inquiry')
@UseGuards(ProjectGuard, UserAuthGuard, SourceGuard)
export class InquiryController {
	private readonly logger = new Logger(InquiryController.name)

	constructor(
		private readonly projectService: ProjectService,
		private readonly service: InquiryService
	) {}

	@Post('index')
	async index(@Body() { source, output, options }: InquiryRequestDto, @Req() req: Request & { projectId: string }
	): Promise<InquiryResponseDto> {
		const projectId = req.projectId
		this.logger.log(clc.cyan(clc.bold('--- Inquiry Index ---')))
		this.logger.log(`${clc.cyan('Source:')} ${clc.yellow(source)}`)

		const { db } = await this.projectService.getProjectContext(projectId)
		this.logger.log(`${clc.cyan('Database:')} ${clc.blue(db.databaseName)}`)

		const col = db.collection(source)
		// Use the filter parsed from options (getOptions) to find a single document
		const { filter } = this.service.getOptions(options ?? {})

		const { projection, nested } = this.service.getProjection(output)

		const doc = await col.findOne(filter ?? {}, { projection })
		if (!doc) throw new Error('Document not found')

		// For each nested key, call upload to populate associations (same approach as retrieve)
		for (const key of Object.keys(nested)) {
			const childProj = { [key]: nested[key] }
			const childOpt = ((options as Record<string, unknown> | undefined)?.[key] as Record<string, unknown>) ?? {}
			await this.service.upload(doc, childProj, db, source, childOpt)
		}

		const item = this.service.serialize(doc)
		// Return a single item (InquiryResponseDto supports returning either items or a single item)
		return { item }
	}

	@ApiBody(RetrieveRequestDoc)
	@ApiOkResponse(RetrieveResponseDoc)
	@Post('retrieve')
	async retrieve(@Body() { source, output, options }: InquiryRequestDto, @Req() req: Request & { projectId: string }): Promise<InquiryResponseDto> {
		const projectId = req.projectId
		this.logger.log(clc.cyan(clc.bold('--- Inquiry Retrieve ---')))
		this.logger.log(`${clc.cyan('Source:')} ${clc.yellow(source)}`)
		this.logger.log(`${clc.cyan('ProjectId:')} ${clc.magenta(projectId)}`)

		const { db } = await this.projectService.getProjectContext(projectId)
		this.logger.log(`${clc.cyan('Database:')} ${clc.blue(db.databaseName)}`)

		const col = db.collection(source)
		const { filter, sort, pagination } = this.service.getOptions(options ?? {})

		const { projection, nested } = this.service.getProjection(output)

		let cursor = col.find(filter ?? {}, { projection }).sort(sort ?? {})
		if (pagination) {
			// compute total/pages only when pagination exists
			pagination.total = await col.countDocuments(filter ?? {})
			pagination.pages = Math.ceil(pagination.total / pagination.limit)
			cursor = cursor.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit)
		}

		const rawDocs = await cursor.toArray()
		const docs = rawDocs.map(d => ({ ...d }))

		// expand nested data for each document
		for (const doc of docs) {
			await this.service.upload(doc, nested as Record<string, unknown>, db, source, options ?? {})
		}

		const items = this.service.serialize(docs)

		return pagination ? { items, pagination } : { items }
	}
}