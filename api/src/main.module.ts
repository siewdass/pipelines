import { Module } from '@nestjs/common'
import { MutationModule } from './mutation/mutation.module'
import { ProjectModule } from './project/project.module'

import { MongooseModule } from '@nestjs/mongoose'
import { InquiryModule } from './inquiry/inquiry.module'
import { AuthenticationModule } from './authentication/authentication.module'
import { DatabaseModule } from './database/database.module'
import { AuthorizationModule } from './authorization/authorization.module'

import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		MongooseModule.forRootAsync({
			connectionName: 'default',
			useFactory: () => ({
				uri: process.env.MONGO_URI || 'mongodb://localhost:27017/default',
			}),
		}),
		ProjectModule,
		MutationModule,
		InquiryModule,
		AuthenticationModule,
		DatabaseModule,
		AuthorizationModule,
	],
	providers: [],
	exports: [],
})
export class MainModule {}
