import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Source, SourceSchema } from './source.schema'
import { Build, BuildSchema } from '../build/build.schema'
import { SourceService } from './source.service'
import { BuildService } from '../build/build.service'
import { SourceController } from './source.controller'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Source.name, schema: SourceSchema },
			{ name: Build.name, schema: BuildSchema },
		], 'default')
	],
	controllers: [ SourceController ],
	providers: [ SourceService, BuildService ],
	exports: [ SourceService, BuildService, MongooseModule ],
})
export class SourceModule {}
