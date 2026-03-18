import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common'
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
import { SourceGuard } from '../authorization/source.guard'
import { clc } from '../utils/colors'

@Controller('mutation')
@UseGuards(ProjectGuard, UserAuthGuard, SourceGuard)
export class MutationController {
	private readonly logger = new Logger(MutationController.name)

	constructor(
		private readonly projectService: ProjectService,
		private readonly mutateService: MutationService
	) {}

	@ApiBody(UpsertRequestDoc)
	@ApiOkResponse(UpsertResponseDoc)
	@Post('upsert')
	async update(@Body() { source, input, options }: MutationRequestDto, @Req() req: Request & { projectId: string }): Promise<MutationResponseDto> {
		const projectId = req.projectId
		this.logger.log(clc.magenta(clc.bold('--- Upsert Start ---')))
		this.logger.log(`${clc.cyan('Source:')} ${clc.yellow(source)}`)
		this.logger.log(`${clc.cyan('ProjectId:')} ${clc.magenta(projectId)}`)
		
		const { db, startSession } = await this.projectService.getProjectContext(projectId)
		this.logger.log(`${clc.cyan('Database:')} ${clc.blue(db.databaseName)}`)
		
		let session: any = null
		try {
			session = await startSession()
			const topology = session.client.topology?.description?.type || session.client.topology?.type
			this.logger.log(`${clc.cyan('Session started. Topology:')} ${clc.gray(topology)}`)
			
			if (topology === 'Single' || !topology) {
				this.logger.warn(clc.yellow('Standalone Mongo detected. Sessions/Transactions NOT supported.'))
				await session.endSession()
				session = null
			}
		} catch (e: any) {
			this.logger.warn(`${clc.red('Could not start session:')} ${e.message}`)
			session = null
		}

		try {
			const execute = async (s?: any) => {
				const docs = Array.isArray(input) ? input as any[] : [ input ]
				this.logger.log(`${clc.cyan('Processing:')} ${clc.bold(String(docs.length))} documentos.`)
				
				const settings = this.mutateService.getOptions(options || {})
				this.logger.log(`${clc.cyan('Options:')} ${clc.gray(JSON.stringify(settings))}`)
				
				const collection = db.collection(source)

				if (settings.uniques) {
					this.logger.log(`${clc.cyan('Checking uniques:')} ${clc.magenta(settings.uniques.join(', '))}`)
					await this.mutateService.uniques(collection, docs, settings.uniques, s)
				}

				for (const doc of docs) {
					if (!doc || typeof doc !== 'object') {
						this.logger.warn('Invalid doc skipped:', doc)
						continue
					}
					
					let finalId = doc.id || doc._id
					
					// Auto-resolve ID by unique fields if missing
					if (!finalId && settings.uniques) {
						const existingId = await this.mutateService.findExistingId(collection, doc, settings.uniques, s)
						if (existingId) {
							finalId = existingId
							this.logger.log(`${clc.blue('Resolved existing ID by uniques:')} ${clc.magenta(finalId)}`)
						}
					}

					if (!finalId) {
						doc._id = uuidv4()
						this.logger.log(`${clc.green('Generated UUID for doc:')} ${clc.magenta(doc._id)}`)
					} else {
						doc._id = finalId
						this.logger.log(`${clc.blue('Using final id/_id:')} ${clc.magenta(doc._id)}`)
					}
					// Ensure original id is removed to avoid duplicate fields in DB
					delete doc.id
					
					this.logger.log(clc.gray(`Calling download/nesting for doc ${doc._id}...`))
					await this.mutateService.download(db, doc, source, doc._id, settings, s, 'upsert')
					
					this.logger.log(`${clc.blue('Executing updateOne (upsert:true) for:')} ${clc.magenta(doc._id)}`)
					const res = await collection.updateOne(
						{ _id: doc._id }, 
						{ $set: doc }, 
						{ upsert: true, session: s }
					)
					this.logger.log(`${clc.green('Result for')} ${clc.magenta(doc._id)}: matched=${res.matchedCount}, upserted=${res.upsertedCount}`)
				}
				return { success: true, message: 'Upsert operation completed successfully.', docs }
			}

			if (session) {
				this.logger.log(clc.magenta('Running within Transaction...'))
				try {
					const result = await session.withTransaction(() => execute(session))
					this.logger.log(clc.green('Transaction committed successfully.'))
					return result
				} finally {
					await session.endSession()
				}
			} else {
				this.logger.log(clc.magenta('Running direct operations (No Session)...'))
				const result = await execute()
				this.logger.log(clc.green('Operations completed.'))
				return result
			}
		} catch (error: any) {
			this.logger.error(`${clc.red('[MUTATION ERROR]')} ${error.message}`)
			return { success: false, message: typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error)) }
		}
	}

	@ApiBody(PurgedRequestDoc)
	@ApiOkResponse(PurgeResponseDoc)
	@Post('purge')
	async purge(@Body() { source, input }: MutationRequestDto, @Req() req: Request & { projectId: string }): Promise<MutationResponseDto> {
		const projectId = req.projectId
		this.logger.log(clc.magenta(clc.bold('--- Purge Start ---')))
		this.logger.log(`${clc.cyan('Source:')} ${clc.yellow(source)}`)

		const { db, startSession } = await this.projectService.getProjectContext(projectId)
		this.logger.log(`${clc.cyan('Database:')} ${clc.blue(db.databaseName)}`)
		
		let session: any = null
		try { 
			session = await startSession() 
			this.logger.log(clc.cyan('Session started for purge.'))
		} catch (e: any) { 
			session = null 
		}

		try {
			const execute = async (s?: any) => {
				const docsToPurge = Array.isArray(input) ? input as any[] : [ input ]
				this.logger.log(`${clc.red('Purging')} ${clc.bold(String(docsToPurge.length))} documents from ${clc.yellow(source)}`)
				if (docsToPurge.length === 0) return { success: true, message: 'No documents to purge.' }

				const collection = db.collection(source)

				for (const doc of docsToPurge as Doc[]) {
					if (!doc.id) throw new Error('id required for purge')
					await this.mutateService.download(db, doc, source, doc.id, {}, s, 'delete')
				}

				const ids = docsToPurge.map(doc => (doc as Doc).id)
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
		} catch (error: any) {
			return { success: false, message: typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error)) }
		}
	}
}