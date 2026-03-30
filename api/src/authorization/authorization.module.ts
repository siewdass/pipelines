import { Module } from '@nestjs/common'
import { AuthorizationController } from './authorization.controller'
import { SourceGuard } from './source.guard'
import { ProjectModule } from '../project/project.module'

@Module({
	imports: [ ProjectModule ],
	controllers: [ AuthorizationController ],
	providers: [ SourceGuard ],
	exports: [ SourceGuard ]
})
export class AuthorizationModule {}