import { v4 as uuidv4 } from 'uuid'
import type { Db } from '../types'

export class RealtimeService {
	private readonly protectedSources = [ 'user', 'users', 'role', 'roles', 'permission', 'permissions' ]

	isProtectedSource(source: string): boolean {
		return this.protectedSources.includes(source.toLowerCase())
	}

	buildRoomName(source?: string, channel: string = ''): string {
		if (source && channel) return `${source}:${channel}`
		return channel
	}

	async saveAndPrune(
		db: Db,
		source: string,
		roomName: string,
		input: any,
		userId?: string
	): Promise<any> {
		if (!source) return input

		try {
			const docId = uuidv4()
			const doc = {
				_id: docId,
				...input,
				_roomId: roomName,
				_userId: userId,
				_createdAt: new Date()
			}

			const col = db.collection(source)
			await col.insertOne(doc)

			const cutoffData = await col
				.find({ _roomId: roomName })
				.sort({ _createdAt: -1 })
				.skip(1000)
				.limit(1)
				.toArray()

			if (cutoffData.length > 0) {
				const cutoffDoc = cutoffData[0]
				await col.deleteMany({
					_roomId: roomName,
					_createdAt: { $lte: cutoffDoc._createdAt }
				})
			}

			return doc
		} catch (error: any) {
			return { ...input, _fallback: true, timestamp: new Date() }
		}
	}

	async fetchRecent(db: Db, source: string, roomName: string, limit: number = 50): Promise<any[]> {
		if (!source) return []
		try {
			const col = db.collection(source)
			const recent = await col
				.find({ _roomId: roomName })
				.sort({ _createdAt: -1 })
				.limit(limit)
				.toArray()
			return recent.reverse()
		} catch (error) {
			return []
		}
	}
}
