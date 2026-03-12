import { Module } from '@nestjs/common'
import { ProjectModule } from '../project/project.module'
import { MutationController } from './mutation.controller'
import { MutationService } from './mutation.service'

@Module({
	imports: [ ProjectModule ],
	controllers: [ MutationController ],
	providers: [ MutationService ],
})
export class MutationModule {}