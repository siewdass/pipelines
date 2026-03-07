import { Controller, OnModuleInit, Post, Body, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { DbMap } from './dbmap.schema'
import { CreateDatabaseDto } from './database.dto'

@Controller('database')
export class DatabaseController {
	constructor(@InjectModel(DbMap.name, 'admin') private readonly dbMapModel: Model<DbMap & mongoose.Document>) {}

	/*async onModuleInit() {
		try {
			// use the injected admin model for seeding
			await this.dbMapModel.updateOne({ token: 'token_db1' }, { $set: { token: 'token_db1', dbName: 'db1' } }, { upsert: true })
			await this.dbMapModel.updateOne({ token: 'token_db2' }, { $set: { token: 'token_db2', dbName: 'db2' } }, { upsert: true })
		} catch (err) {
			// ignore seeding errors in environments without write access
			console.warn('DbMap seeding skipped:', err)
		}
	}*/

	@Post('create')
	async createDatabase(@Body() body: CreateDatabaseDto) {
		const { dbName, projectId, token, origin } = body

		try {

			if (token) {
				await this.dbMapModel.updateOne({ token }, { $set: { token, dbName, projectId, origin } }, { upsert: true })
			}

			return { ok: true }
		} catch (err) {
			throw new BadRequestException('failed to create database')
		}
	}
}