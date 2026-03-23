import { Module, Global } from '@nestjs/common'
import { RealtimeGateway } from './realtime.gateway'
import { RealtimeService } from './realtime.service'
import { ProjectModule } from '../project/project.module'

@Global()
@Module({
	imports: [ ProjectModule ],
	providers: [ RealtimeGateway, RealtimeService ],
	exports: [ RealtimeGateway, RealtimeService ],
})
export class RealtimeModule {}
