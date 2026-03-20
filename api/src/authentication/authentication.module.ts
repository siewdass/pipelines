import { Module } from '@nestjs/common'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { ProjectModule } from '../project/project.module'

@Module({
	imports: [
		ProjectModule,
	],
	controllers: [ AuthenticationController ],
	providers: [ AuthenticationService ],
	exports: [ AuthenticationService ],
})
export class AuthenticationModule {}