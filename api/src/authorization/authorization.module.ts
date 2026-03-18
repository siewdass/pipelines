import { Module } from '@nestjs/common'
import { AuthorizationController } from './authorization.controller'
import { SourceGuard } from './source.guard'

@Module({
	imports: [],
	controllers: [ AuthorizationController ],
	providers: [ SourceGuard ],
	exports: [ SourceGuard ]
})
export class AuthorizationModule {}