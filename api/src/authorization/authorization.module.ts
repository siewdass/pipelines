import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthorizationController } from './authorization.controller'

@Module({
	imports: [],
	controllers: [ AuthorizationController ],
})
export class AuthorizationModule {}