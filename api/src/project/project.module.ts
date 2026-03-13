import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { Project, ProjectSchema } from './project.schema'
import { Origin, OriginSchema } from './origin.schema'

import { ProjectGuard } from './project.guard'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Project.name, schema: ProjectSchema },
			{ name: Origin.name, schema: OriginSchema }
		], 'default'),
	],
	providers: [ ProjectService, ProjectGuard ],
	controllers: [ ProjectController ],
	exports: [ ProjectService, ProjectGuard, MongooseModule ],
})
export class ProjectModule {}