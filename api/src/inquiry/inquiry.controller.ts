import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common'
import { InquiryRequestDto, InquiryResponseDto } from './inquiry.dto'
import { ProjectService } from '../project/project.service'
import { InquiryService } from './inquiry.service'
import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { RetrieveRequestDoc, RetrieveResponseDoc } from './inquiry.doc'
import { AccountAuthGuard } from '../authorization/account.guard'
import { ProjectGuard } from '../project/project.guard'

@Controller('inquiry')
@UseGuards(AccountAuthGuard, ProjectGuard)
export class InquiryController {
	constructor(
    private readonly projectService: ProjectService,
    private readonly service: InquiryService
	) {}

	@Post('index')
	async index(@Body() { source, output, options }: InquiryRequestDto, @Headers('project-id') projectId: string
	): Promise<InquiryResponseDto> {
		const { db } = this.projectService.getProjectContext(projectId)

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
	async retrieve(@Body() { source, output, options }: InquiryRequestDto, @Headers('project-id') projectId: string): Promise<InquiryResponseDto> {
		const { db } = this.projectService.getProjectContext(projectId)

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

		const docs = await cursor.toArray()
		// For each document, call populate for each nested key separately
		for (const doc of docs) {
			for (const key of Object.keys(nested)) {
				const childProj = { [key]: nested[key] }
				const childOpt = ((options as Record<string, unknown> | undefined)?.[key] as Record<string, unknown>) ?? {}
				// merge settingsMap with childOptions under a reserved key so populate can access both
				await this.service.upload(doc, childProj, db, source, childOpt)
			}
		}

		const items = this.service.serialize(docs)

		return pagination ? { items, pagination } : { items }
	}
}