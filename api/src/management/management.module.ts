import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ManagementService } from './management.service'
import { ManagementController } from './management.controller'

@Module({
	imports: [ DatabaseModule ],
	controllers: [ ManagementController ],
	providers: [ ManagementService ],
})
export class ManagementModule {}
