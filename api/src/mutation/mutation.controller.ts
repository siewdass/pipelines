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
@UseGuards(ProjectGuard, UserAuthGuard)
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
		console.log(`\n[MUTATION] --- Upsert Start ---`)
		console.log(`[MUTATION] Source: ${source}`)
		console.log(`[MUTATION] ProjectId from Req: ${projectId}`)
		
		const { db, startSession } = await this.projectService.getProjectContext(projectId)
		console.log(`[MUTATION] DB Name from Context: ${db.databaseName}`)
		
		let session: any = null
		try {
			session = await startSession()
			// Topology structure varies by driver version. We check for 'ReplicaSetNoPrimary', 'ReplicaSetWithPrimary', etc.
			// If it's 'Single', it's Standalone.
			const topology = session.client.topology?.description?.type || session.client.topology?.type
			console.log(`[MUTATION] Session started. Topology: ${topology}`)
			
			if (topology === 'Single' || !topology) {
				console.warn(`[MUTATION] Standalone Mongo detected. Sessions/Transactions NOT supported.`)
				await session.endSession()
				session = null
			}
		} catch (e) {
			console.warn(`[MUTATION] Could not start session (likely Standalone): ${e.message}`)
			session = null
		}

		try {
			const execute = async (s?: any) => {
				const docs = Array.isArray(input) ? input as any[] : [ input ]
				console.log(`[MUTATION] Processing ${docs.length} documents.`)
				
				const settings = this.mutateService.getOptions(options || {})
				console.log(`[MUTATION] Options: ${JSON.stringify(settings)}`)
				
				const collection = db.collection(source)

				if (settings.uniques) {
					console.log(`[MUTATION] Checking uniques: ${settings.uniques}`)
					await this.mutateService.uniques(collection, docs, settings.uniques, s)
				}

				for (const doc of docs) {
					if (!doc || typeof doc !== 'object') {
						console.warn(`[MUTATION] Invalid doc skipped:`, doc)
						continue
					}
					
					const finalId = doc.id || doc._id
					if (!finalId) {
						doc._id = uuidv4()
						console.log(`[MUTATION] Generated UUID for doc: ${doc._id}`)
					} else {
						doc._id = finalId
						console.log(`[MUTATION] Using existing id/_id: ${doc._id}`)
					}
					// Ensure original id is removed to avoid duplicate fields in DB
					delete doc.id
					
					console.log(`[MUTATION] Calling download/nesting for doc...`)
					await this.mutateService.download(db, doc, source, doc._id, settings, s, 'upsert')
					
					console.log(`[MUTATION] Executing updateOne (upsert:true) for: ${doc._id}`)
					const res = await collection.updateOne(
						{ _id: doc._id }, 
						{ $set: doc }, 
						{ upsert: true, session: s }
					)
					console.log(`[MUTATION] Result for ${doc._id}: matched=${res.matchedCount}, upserted=${res.upsertedCount}, acknowledged=${res.acknowledged}`)
				}
				return { success: true, message: 'Upsert operation completed successfully.' }
			}

			if (session) {
				console.log(`[MUTATION] Running within Transaction...`)
				try {
					const result = await session.withTransaction(() => execute(session))
					console.log(`[MUTATION] Transaction committed successfully.`)
					return result
				} finally {
					await session.endSession()
				}
			} else {
				console.log(`[MUTATION] Running direct operations (No Session)...`)
				const result = await execute()
				console.log(`[MUTATION] Operations completed.`)
				return result
			}
		} catch (error) {
			console.error(`[MUTATION ERROR]`, error)
			return { success: false, message: typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error)) }
		}
	}

	@ApiBody(PurgedRequestDoc)
	@ApiOkResponse(PurgeResponseDoc)
	@Post('purge')
	async purge(@Body() { source, input }: MutationRequestDto, @Req() req: Request & { projectId: string }): Promise<MutationResponseDto> {
		const projectId = req.projectId
		const { db, startSession } = await this.projectService.getProjectContext(projectId)
		
		let session: any = null
		try { session = await startSession() } catch (e) { session = null }

		try {
			const execute = async (s?: any) => {
				const docs = Array.isArray(input) ? input as any[] : [ input ]
				if (docs.length === 0) return { success: true, message: 'No documents to purge.' }

				const collection = db.collection(source)

				for (const doc of docs as Doc[]) {
					if (!doc.id) throw new Error('id required for purge')
					await this.mutateService.download(db, doc, source, doc.id, {}, s, 'delete')
				}

				const ids = docs.map(doc => (doc as Doc).id)
				await collection.deleteMany({ _id: { $in: ids } }, { session: s })

				return { success: true, message: 'Purge operation completed successfully.' }
			}

			if (session && session.client.topology.type !== 'Single') {
				try {
					const result = await session.withTransaction(() => execute(session))
					await session.endSession()
					return result
				} catch (txnError) {
					await session.endSession()
					throw txnError
				}
			} else {
				if (session) await session.endSession()
				return await execute()
			}
		} catch (error) {
			return { success: false, message: typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error)) }
		}
	}
}