import { Module } from '@nestjs/common'
import { AssembleController } from './assemble.controller'
import { AssembleService } from './assemble.service'
import { ProjectModule } from '../project/project.module'

@Module({
	imports: [ ProjectModule ],
	controllers: [ AssembleController ],
	providers: [ AssembleService ],
	exports: [ AssembleService ],
})
export class AssembleModule {}
