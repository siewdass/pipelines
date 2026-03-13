import { Injectable, OnModuleInit } from '@nestjs/common'
import * as mongoose from 'mongoose'

@Injectable()
export class ProjectService {
	private baseConnection: mongoose.Connection

	/*async onModuleInit() {
		// Conexión base al servidor MongoDB (sin DB específica)
		this.baseConnection = await mongoose.createConnection('mongodb://localhost:27017')
	}*/

	async getProjectContext(projectId: string) {
		// Lazy-init the base connection if another module called us before onModuleInit finished
		if (!this.baseConnection) {
			this.baseConnection = mongoose.createConnection(process.env.MONGO_URI || 'mongodb://localhost:27017')
			await (this.baseConnection as any).asPromise()
		}
		console.log(`[PROJECT SERVICE] Using project/database: ${projectId}`)
		const connection = this.baseConnection.useDb(projectId, { useCache: true })
		if (connection.readyState !== 1) {
			await (connection as any).asPromise()
		}
		return {
			connection,
			db: connection.db!,
			startSession: () => connection.startSession(),
		}
	}

	async getProjectModel(projectId: string, schema: any, modelName: string): Promise<any> {
		const { connection } = await this.getProjectContext(projectId)
		// If the model already exists on this connection, reuse it.
		if (connection && connection.models && (connection.models as Record<string, any>)[modelName]) {
			return (connection.models as Record<string, any>)[modelName]
		}
		// Otherwise register and return the model.
		return connection.model(modelName, schema)
	}

}