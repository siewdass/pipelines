import mongoose from 'mongoose'
import { config } from '../config'

let baseConnection: mongoose.Connection | null = null
let connecting: Promise<mongoose.Connection> | null = null

export async function getContext(projectId: string) {
	if (!baseConnection) {
		if (!connecting) {
		connecting = mongoose.createConnection(config.mongoUri, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000,
		}).asPromise()
		}
		baseConnection = await connecting
	}
	const connection = baseConnection.useDb(projectId, { useCache: true })
	return { connection, db: connection.db! }
}
