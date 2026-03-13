import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common'
import { Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { ProjectService } from '../project/project.service'
import { MutationService } from './mutation.service'
import { Doc } from './mutation.type'
import { ApiOkResponse, ApiBody } from '@nestjs/swagger'
import { UpsertRequestDoc, UpsertResponseDoc, PurgedRequestDoc, PurgeResponseDoc } from './mutation.doc'
import { MutationRequestDto, MutationResponseDto } from './mutation.dto'
import { UserAuthGuard } from '../authorization/user.guard'
import { ProjectGuard } from '../project/project.guard'

@Controller('mutation')
@UseGuards(UserAuthGuard, ProjectGuard)
export class MutationController {
	constructor(
    private readonly projectService: ProjectService,
    private readonly mutateService: MutationService
	) {}

	@ApiBody(UpsertRequestDoc)
	@ApiOkResponse(UpsertResponseDoc)
  @Post('upsert')
	async update(@Body() { source, input, options }: MutationRequestDto, @Req() req: Request & { projectId: string }): Promise<MutationResponseDto> {
		const projectId = req.projectId
  	const { db, startSession } = await this.projectService.getProjectContext(projectId)
  	const session = await startSession()

		try {
			return await session.withTransaction(async () => {
				// Ensure input is an array of docs for the required source collection
				const docs = Array.isArray(input) ? input as any[] : [ input ]
				const settings = this.mutateService.getOptions(options || {})
				const collection = db.collection(source)

				if (settings.uniques) {
					await this.mutateService.uniques(collection, docs, settings.uniques, session)
				}

				await Promise.all(docs.map(async (doc: any) => {
					if (!doc || typeof doc !== 'object') return
					if (!doc._id) {
						doc._id = uuidv4()
						await this.mutateService.download(db, doc, source, doc._id, settings, session, 'upsert')
						await collection.insertOne(doc, { session })
					} else {
						await this.mutateService.download(db, doc, source, doc._id, settings, session, 'upsert')
						await collection.updateOne({ _id: doc._id }, { $set: doc }, { session })
					}
				}))
				return { success: true, message: 'Upsert operation completed successfully.' }
			})
		} catch (error) {
  		return { success: false, message: typeof error === 'string' ? error : error.message }
  	}
	}

	@ApiBody(PurgedRequestDoc)
	@ApiOkResponse(PurgeResponseDoc)
	@Post('purge')
	async purge(@Body() { source, input }: MutationRequestDto, @Req() req: Request & { projectId: string }): Promise<MutationResponseDto> {
		const projectId = req.projectId
		const { db, startSession } = await this.projectService.getProjectContext(projectId)
		const session = await startSession()

		try {
			return await session.withTransaction(async () => {
				const docs = Array.isArray(input) ? input as any[] : [ input ]
				if (docs.length === 0) return { success: true, message: 'No documents to purge.' }

				const collection = db.collection(source)

				await Promise.all((docs as Doc[]).map(async (doc) => {
					if (!doc.id) throw new Error('id required for purge')
					// pass the account-provided id to mutateService; it may map or handle it
					await this.mutateService.download(db, doc, source, doc.id, {}, session, 'delete')
				}))

				// The actual MongoDB key remains _id; use the provided ids for the query
				const ids = docs.map(doc => doc.id)
				await collection.deleteMany({ _id: { $in: ids } }, { session })

				return { success: true, message: 'Purge operation completed successfully.' }
			})
		} catch (error) {
			return { success: false, message: typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error)) }
		}
	}
}