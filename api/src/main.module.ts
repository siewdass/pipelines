import { Module } from '@nestjs/common'
// import { MutationModule } from './mutation/mutation.module'
import { ProjectModule } from './project/project.module'

import { MongooseModule } from '@nestjs/mongoose'
// import { InquiryModule } from './inquiry/inquiry.module'
import { AuthenticationModule } from './authentication/authentication.module'
import { DatabaseModule } from './database/database.module'
import { AuthorizationModule } from './authorization/authorization.module'
import { AssembleModule } from './assemble/assemble.module'
// import { ServeModule } from './serve/serve.module'
import { SourceModule } from './source/source.module'
import { RealtimeModule } from './realtime/realtime.module'

import { ConfigModule } from '@nestjs/config'
import { UserModule } from './user/user.module'

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
		// MutationModule,
		// InquiryModule,
		AuthenticationModule,
		DatabaseModule,
		AuthorizationModule,
		AssembleModule,
		// ServeModule,
		SourceModule,
		RealtimeModule,
		UserModule,
	],
	providers: [],
	exports: [],
})
export class MainModule {}
