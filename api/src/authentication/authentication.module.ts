import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { User, UserSchema } from './user.schema'
import { DatabaseModule } from '../database/database.module'

@Module({
	imports: [
		DatabaseModule,
	],
	controllers: [ AuthenticationController ],
	providers: [ AuthenticationService ],
	exports: [ AuthenticationService ],
})
export class AuthenticationModule {}