import mongoose from 'mongoose'
import { config } from '../config'

let baseConnection: mongoose.Connection | null = null

export async function getContext(projectId: string) {
	if (!baseConnection) {
		baseConnection = mongoose.createConnection(config.mongoUri)
		await baseConnection.asPromise()
	}
	const connection = baseConnection.useDb(projectId, { useCache: true })
	return { connection, db: connection.db! }
}
