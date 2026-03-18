import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common'
import { clc } from '../utils/colors'

@Injectable()
export class SourceGuard implements CanActivate {
	private readonly protectedSources = [ 'user', 'users', 'role', 'roles', 'permission', 'permissions' ]
	private readonly logger = new Logger(SourceGuard.name)

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest()
		const source = request.body?.source

		if (source && this.protectedSources.includes(source.toLowerCase())) {
			this.logger.warn(`${clc.red('Blocked access to protected collection:')} ${source}`)
			throw new ForbiddenException(`Direct access to the '${source}' collection is not allowed through this endpoint.`)
		}

		return true
	}
}
