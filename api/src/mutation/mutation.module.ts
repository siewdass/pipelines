import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { MutationController } from './mutation.controller'
import { MutationService } from './mutation.service'

@Module({
	imports: [ DatabaseModule ],
	controllers: [ MutationController ],
	providers: [ MutationService ],
})
export class MutationModule {}