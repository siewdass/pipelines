import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ClientService } from './client.service'
import { ClientController } from './client.controller'

@Module({
	imports: [ DatabaseModule ],
	controllers: [ ClientController ],
	providers: [ ClientService ],
})
export class ClientModule {}
