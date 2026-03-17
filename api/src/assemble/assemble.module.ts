import { Module } from '@nestjs/common'
import { AssembleController } from './assemble.controller'
import { AssembleService } from './assemble.service'

@Module({
	controllers: [ AssembleController ],
	providers: [ AssembleService ],
	exports: [ AssembleService ],
})
export class AssembleModule {}
