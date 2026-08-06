import type { Request, Response, NextFunction } from 'express'
import { config } from '../config'
import { verifyToken } from '../services/auth'

export function userMiddleware(req: Request, _res: Response, next: NextFunction) {
	;(req as any).user = null
	const auth = req.headers.authorization as string
	if (!auth) {
		next()
		return
	}
	try {
		const token = auth.replace('Bearer ', '').trim()
		const payload = verifyToken(token, config.userJwtSecret)
		;(req as any).user = payload
		next()
	} catch {
		next()
	}
}
