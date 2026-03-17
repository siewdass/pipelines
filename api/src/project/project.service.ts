import { Injectable, Logger } from '@nestjs/common'
import * as mongoose from 'mongoose'
import { clc } from '../utils/colors'

@Injectable()
export class ProjectService {
	private readonly logger = new Logger(ProjectService.name)
	private baseConnection: mongoose.Connection

	/*async onModuleInit() {
		// Conexión base al servidor MongoDB (sin DB específica)
		this.baseConnection = await mongoose.createConnection('mongodb://localhost:27017')
	}*/

	async getProjectContext(projectId: string) {
		// Lazy-init the base connection if another module called us before onModuleInit finished
		if (!this.baseConnection) {
			const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'
			this.logger.log(`${clc.cyan('[PROJECT SERVICE]')} Initializing base connection to: ${clc.yellow(uri)}`)
			this.baseConnection = mongoose.createConnection(uri)
			await (this.baseConnection as any).asPromise()
			this.logger.log(`${clc.green('[PROJECT SERVICE]')} Base connection established.`)
		}
		
		this.logger.log(`${clc.blue('[PROJECT SERVICE]')} Requesting context for: ${clc.magenta(projectId)}`)
		const connection = this.baseConnection.useDb(projectId, { useCache: true })
		if (connection.readyState !== 1) {
			this.logger.log(`${clc.gray('[PROJECT SERVICE]')} Waiting for connection to ${projectId} to be ready...`)
			await (connection as any).asPromise()
		}
		this.logger.log(`${clc.green('[PROJECT SERVICE]')} Connection ready: ${clc.blue(String(connection.db?.databaseName))}`)
		
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