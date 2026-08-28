import mongoose from 'mongoose'
import { config } from './config'

export async function getDb() {
	if (mongoose.connection.readyState !== 1) {
		await mongoose.connect(config.mongoUri)
	}
	return mongoose.connection.db!
}
