import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { Project, ProjectSchema } from './project.schema'

import { ProjectGuard } from './project.guard'

@Module({
	imports: [
		MongooseModule.forFeature([ { name: Project.name, schema: ProjectSchema } ], 'admin'),
	],
	providers: [ ProjectService, ProjectGuard ],
	controllers: [ ProjectController ],
	exports: [ ProjectService, ProjectGuard, MongooseModule ],
})
export class ProjectModule {}