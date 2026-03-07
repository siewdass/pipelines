import { Injectable, OnModuleInit } from '@nestjs/common'
import * as mongoose from 'mongoose'

@Injectable()
export class DatabaseService {
	private baseConnection: mongoose.Connection

	/*async onModuleInit() {
		// Conexión base al servidor MongoDB (sin DB específica)
		this.baseConnection = await mongoose.createConnection('mongodb://localhost:27017')
	}*/

	getDbContext(dbName: string) {
		// Lazy-init the base connection if another module called us before onModuleInit finished
		if (!this.baseConnection) {
			this.baseConnection = mongoose.createConnection('mongodb://localhost:27017') as unknown as mongoose.Connection
		}
		const connection = this.baseConnection.useDb(dbName)
		return {
			connection,
			db: connection.db!,
			startSession: () => connection.startSession(),
		}
	}

	getDbModel(dbName: string, schema: any, modelName: string): any {
		const { connection } = this.getDbContext(dbName)
		// If the model already exists on this connection, reuse it.
		if (connection && connection.models && connection.models[modelName]) {
			return connection.models[modelName]
		}
		// Otherwise register and return the model.
		return connection.model(modelName, schema)
	}

}