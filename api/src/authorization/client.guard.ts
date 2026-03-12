import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'

type JwtPayload = { id?: string } & Record<string, unknown>

@Injectable()
export class ClientAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request & { clientId?: string }>()
		const authorization = request.headers.authorization
		const token = authorization?.replace('Bearer ', '').trim()

		if (!token) {
			throw new UnauthorizedException('Token is missing')
		}

		try {
			const secret = process.env.CLIENT_JWT_SECRET || 'dev-client-secret'
			const payload = jwt.verify(token, secret) as JwtPayload
			request.clientId = payload?.id
		} catch (_) {
			throw new UnauthorizedException('Invalid or expired token')
		}

		return true
	}
}
