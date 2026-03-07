import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { MutationModule } from './mutation/mutation.module'
import { DatabaseModule } from './database/database.module'

import { MongooseModule } from '@nestjs/mongoose'
import { InquiryModule } from './inquiry/inquiry.module'
import { AuthenticationModule } from './authentication/authentication.module'
import { DatabaseMiddleware } from './database/database.middleware'
import { AuthorizationMiddleware } from './authorization/authorization.middleware'
import { ManagementModule } from './management/management.module'
import { AuthorizationModule } from './authorization/authorization.module'

@Module({
	imports: [
		MongooseModule.forRoot('mongodb://localhost:27017/default', { connectionName: 'admin' }),
		DatabaseModule,
		MutationModule,
		InquiryModule,
		AuthenticationModule,
		ManagementModule,
		AuthorizationModule,
		DatabaseModule
	],
	providers: [],
	exports: [],
})
export class MainModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// Apply DatabaseMiddleware globally
		consumer.apply(DatabaseMiddleware).forRoutes('*')
		// Apply AuthorizationMiddleware only to mutation and inquiry routes
		consumer.apply(AuthorizationMiddleware).forRoutes('mutation', 'inquiry')
	}
}
