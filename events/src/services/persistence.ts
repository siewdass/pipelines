import { v4 as uuidv4 } from 'uuid'
import { getContext } from './db'

export async function saveAndPrune(
	projectId: string,
	channel: string,
	source: string,
	input: any,
	userId?: string
): Promise<any | undefined> {
	try {
		const { db } = await getContext(projectId)
		const doc = {
			_id: uuidv4() as any,
			...input,
			_channelId: channel,
			_userId: userId,
			_createdAt: new Date()
		}
		const col = db.collection(source)
		await col.insertOne(doc)

		const cutoffData = await col
			.find({ _channelId: channel })
			.sort({ _createdAt: -1 })
			.skip(1000)
			.limit(1)
			.toArray()

		if (cutoffData.length > 0) {
			const cutoffDoc = cutoffData[0]
			await col.deleteMany({
				_channelId: channel,
				_createdAt: { $lte: cutoffDoc._createdAt }
			})
		}

		return doc
	} catch (error: any) {
		console.error(`[Events] Could not persist to project database: ${error?.message || error}`)
		return undefined
	}
}
