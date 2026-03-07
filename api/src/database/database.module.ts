import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DatabaseService } from './database.service'
import { DatabaseController } from './database.controller'
import { DbMap, DbMapSchema } from './dbmap.schema'

@Module({
	imports: [
		MongooseModule.forFeature([ { name: DbMap.name, schema: DbMapSchema } ], 'admin'),
	],
	providers: [ DatabaseService ],
	controllers: [ DatabaseController ],
	exports: [ DatabaseService, MongooseModule ],
})
export class DatabaseModule {}