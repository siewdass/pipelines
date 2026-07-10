import { Module } from '@nestjs/common'
import { AssembleController } from './assemble.controller'
import { AssembleService } from './assemble.service'
import { ProjectModule } from '../project/project.module'
import { SourceModule } from '../source/source.module'
import { MongooseModule } from '@nestjs/mongoose'
import { AssemblePrompt, AssemblePromptSchema } from './prompt.schema'

@Module({
	imports: [
		ProjectModule,
		SourceModule,
		MongooseModule.forFeature([
			{ name: AssemblePrompt.name, schema: AssemblePromptSchema }
		], 'default')
	],
	controllers: [ AssembleController ],
	providers: [ AssembleService ],
	exports: [ AssembleService ],
})
export class AssembleModule {}
