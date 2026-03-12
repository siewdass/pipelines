import { Module } from '@nestjs/common'
import { ProjectModule } from '../project/project.module'
import { ManagementService } from './management.service'
import { ManagementController } from './management.controller'

@Module({
	imports: [ ProjectModule ],
	controllers: [ ManagementController ],
	providers: [ ManagementService ],
})
export class ManagementModule {}
