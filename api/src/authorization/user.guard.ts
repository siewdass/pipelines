import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'

type JwtPayload = { id?: string } & Record<string, unknown>

@Injectable()
export class UserAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request & { userId?: string }>()
		const authorization = request.headers.authorization
		const token = authorization?.replace('Bearer ', '').trim()

		if (token) {
			try {
				const secret = process.env.USER_JWT_SECRET || 'dev-user-secret'
				const payload = jwt.verify(token, secret) as JwtPayload
				request.userId = payload?.id
			} catch {
				// Avoid throwing, allowing public endpoints to process
			}
		}

		return true
	}
}
