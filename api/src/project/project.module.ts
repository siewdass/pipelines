import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { Project, ProjectSchema } from './project.schema'
import { Origin, OriginSchema } from './origin.schema'
import { EmailSetting, EmailSettingSchema } from './email-setting.schema'
import { Account, AccountSchema } from '../account/account.schema'

import { ProjectGuard } from './project.guard'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Project.name, schema: ProjectSchema },
			{ name: Origin.name, schema: OriginSchema },
			{ name: EmailSetting.name, schema: EmailSettingSchema },
			{ name: Account.name, schema: AccountSchema }
		], 'default'),
	],
	providers: [ ProjectService, ProjectGuard ],
	controllers: [ ProjectController ],
	exports: [ ProjectService, ProjectGuard, MongooseModule ],
})
export class ProjectModule {}