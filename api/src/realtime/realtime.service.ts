import { Injectable, Logger } from '@nestjs/common'
import { ProjectService } from '../project/project.service'
import { Types } from 'mongoose'

@Injectable()
export class RealtimeService {
	private readonly logger = new Logger(RealtimeService.name)

	constructor(private readonly projectService: ProjectService) {}

	/**
	 * Guarda el evento publicado en la colección (source) del proyecto y 
	 * recorta de forma proactiva todos los registros en esa misma sala (room) 
	 * que excedan un límite seguro (ej. 1000).
	 */
	async saveAndPrune(
		projectId: string,
		source: string,
		roomName: string,
		input: any,
		userId?: string
	): Promise<any> {
		if (!source) return input

		try {
			const context = await this.projectService.getProjectContext(projectId)
			const db = context.db

			// Creamos un _id de string, común en la arquitectura de Pipelines
			const docId = new Types.ObjectId().toString()

			// Documento con metadatos de ecosistema
			const doc = {
				_id: docId,
				...input,
				_roomId: roomName,
				_userId: userId,
				_createdAt: new Date()
			}

			const col = db.collection(source)
			
			// 1. Guardar
			await col.insertOne(doc)

			// 2. Podar (Pruning) - Mantener 1000 máximos en la sala
			const cutoffData = await col
				.find({ _roomId: roomName })
				.sort({ _createdAt: -1 })
				.skip(1000)
				.limit(1)
				.toArray()

			if (cutoffData.length > 0) {
				const cutoffDoc = cutoffData[0]
				const result = await col.deleteMany({
					_roomId: roomName,
					_createdAt: { $lte: cutoffDoc._createdAt }
				})
				this.logger.log(`Pruned ${result.deletedCount} old events from room ${roomName} in collection ${source}`)
			}

			return doc
		} catch (error) {
			this.logger.error(`Error in saveAndPrune for ${source}: ${error.message}`)
			return { ...input, _fallback: true, timestamp: new Date() }
		}
	}

	buildRoomName(source: string, options?: any): string {
		// If options has a specific ID (like channelId), use it. 
		// Otherwise, use the source name as the base room.
		if (options?.id) return `${source}:${options.id}`
		return source
	}
}
