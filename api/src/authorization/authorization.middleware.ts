import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type ReqWithUserAndOrigin = Request & { userId?: string; origin?: string }

type JwtPayload = { id?: string } & Record<string, unknown>

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
	use(req: ReqWithUserAndOrigin, _res: Response, next: NextFunction) {
		const { Origin, Authorization } = req.headers

		if (!Authorization || typeof Authorization !== 'string') return next()

		const token = Authorization.trim()

		try {
			const secret = process.env.JWT_SECRET || 'dev-secret'
			const payload = jwt.verify(token, secret) as JwtPayload
			req.userId = payload?.id
		} catch (_) {
			// invalid token: continue without userId
		}

		return next()
	}
}
