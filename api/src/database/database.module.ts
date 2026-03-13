import { Module } from '@nestjs/common'
import { ProjectModule } from '../project/project.module'
import { DatabaseService } from './database.service'
import { DatabaseController } from './database.controller'

@Module({
	imports: [ ProjectModule ],
	controllers: [ DatabaseController ],
	providers: [ DatabaseService ],
})
export class DatabaseModule {}
