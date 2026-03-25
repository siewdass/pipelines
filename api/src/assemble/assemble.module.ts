import { Module } from '@nestjs/common'
import { AssembleController } from './assemble.controller'
import { AssembleService } from './assemble.service'
import { ProjectModule } from '../project/project.module'
import { MongooseModule } from '@nestjs/mongoose'
import { AssembleConfig, AssembleConfigSchema } from './config.schema'
import { AssemblePrompt, AssemblePromptSchema } from './prompt.schema'

@Module({
	imports: [
		ProjectModule,
		MongooseModule.forFeature([ 
			{ name: AssembleConfig.name, schema: AssembleConfigSchema },
			{ name: AssemblePrompt.name, schema: AssemblePromptSchema } 
		], 'default')
	],
	controllers: [ AssembleController ],
	providers: [ AssembleService ],
	exports: [ AssembleService ],
})
export class AssembleModule {}
