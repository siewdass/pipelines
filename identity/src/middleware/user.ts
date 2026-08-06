import type { Request, Response, NextFunction } from 'express'
import { config } from '../config'
import { verifyToken } from '../services/auth'

export function userMiddleware(req: Request, _res: Response, next: NextFunction) {
	const auth = req.headers.authorization as string
	if (!auth) {
		next()
		return
	}
	try {
		const token = auth.replace('Bearer ', '').trim()
		const payload = verifyToken(token, config.userJwtSecret)
		;(req as any).userId = payload.id
		next()
	} catch {
		next()
	}
}
