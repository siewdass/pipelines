import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'

type JwtPayload = { id?: string } & Record<string, unknown>

@Injectable()
export class AccountAuthGuard implements CanActivate {
	private readonly logger = new Logger(AccountAuthGuard.name)

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request & { accountId?: string }>()
		const authorization = request.headers.authorization
		const token = authorization?.replace('Bearer ', '').trim()

		if (!token) {
			throw new UnauthorizedException('Token is missing')
		}

		try {
			const secret = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'
			const payload = jwt.verify(token, secret) as JwtPayload
			request.accountId = payload?.id
		} catch (error: any) {
			this.logger.error(`[AUTH] Account Auth Error: ${error.message}`)
			throw new UnauthorizedException('Invalid or expired token')
		}

		return true
	}
}
