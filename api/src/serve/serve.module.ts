import { Module } from '@nestjs/common'
import { ServeController } from './serve.controller'
import { AssembleModule } from '../assemble/assemble.module'
import { ProjectModule } from '../project/project.module'

@Module({
	imports: [ AssembleModule, ProjectModule ],
	controllers: [ ServeController ],
	providers: [],
})
export class ServeModule {}
