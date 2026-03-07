import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import { DbMap } from './dbmap.schema'
import { Model } from 'mongoose'

@Injectable()
export class DatabaseMiddleware implements NestMiddleware {
	constructor(@InjectModel(DbMap.name, 'admin') private readonly dbMapModel: Model<DbMap & mongoose.Document>) {}

	async use(req: Request, _res: Response, next: NextFunction) {
		// tolerant header lookup
		const headers = req.headers as Record<string, string | string[] | undefined>
		const rawToken = headers['db-token'] || headers['db_token'] || headers['dbtoken']
		const dbToken = Array.isArray(rawToken) ? rawToken[0] : rawToken
		if (!dbToken || typeof dbToken !== 'string') throw new BadRequestException('Invalid or missing db-token')

		try {
			// Use the injected model bound to the 'admin' connection
			const doc = await this.dbMapModel.findOne({ token: dbToken }).lean().exec()
			if (!doc) throw new BadRequestException('Invalid db-token')
			req['dbName'] = (doc as unknown as { dbName?: string }).dbName
			next()
		} catch (err) {
			throw new BadRequestException('Invalid or missing db-token')
		}
	}
}
