import { Controller, Post, Body, Headers } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { DatabaseService } from '../database/database.service'
import { MutationService } from './mutation.service'
import { Doc } from './mutation.type'
import { ApiOkResponse, ApiBody } from '@nestjs/swagger'
import { UpsertRequestDoc, UpsertResponseDoc, PurgedRequestDoc, PurgeResponseDoc } from './mutation.doc'
import { MutationRequestDto, MutationResponseDto } from './mutation.dto'

@Controller('mutation')
export class MutationController {
	constructor(
    private readonly dbService: DatabaseService,
    private readonly mutateService: MutationService
	) {}

	@ApiBody(UpsertRequestDoc)
	@ApiOkResponse(UpsertResponseDoc)
  @Post('upsert')
	async update(@Body() { source, input, options }: MutationRequestDto, @Headers('db-name') dbName: string): Promise<MutationResponseDto> {
  	const { db, startSession } = this.dbService.getDbContext(dbName)
  	const session = await startSession()

		try {
			return await session.withTransaction(async () => {
				// Ensure input is an array of docs for the required source collection
				const docs = Array.isArray(input) ? input as any[] : [ input ]
				const collection = db.collection(source)
				await Promise.all(docs.map(async (doc: any) => {
					// this.mutateService.timestamp(doc, false, false)
					if (!doc._id) {
						// create path: genera id antes de nested para que los hijos reciban parentId
						doc._id = uuidv4()
						// optionally: this.mutateService.timestamp(doc, false, true) // si activas luego
						await this.mutateService.download(db, doc, source, doc._id, {}, session, 'upsert')
						await collection.insertOne(doc, { session })
					} else {
						// update path: id ya existe
						await this.mutateService.download(db, doc, source, doc._id, {}, session, 'upsert')
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
	async purge(@Body() { source, input }: MutationRequestDto, @Headers('db-name') dbName: string): Promise<MutationResponseDto> {
		const { db, startSession } = this.dbService.getDbContext(dbName)
		const session = await startSession()

		try {
			return await session.withTransaction(async () => {
				const docs = Array.isArray(input) ? input as any[] : [ input ]
				if (docs.length === 0) return { success: true, message: 'No documents to purge.' }

				const collection = db.collection(source)

				await Promise.all((docs as Doc[]).map(async (doc) => {
					if (!doc.id) throw new Error('id required for purge')
					// pass the client-provided id to mutateService; it may map or handle it
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