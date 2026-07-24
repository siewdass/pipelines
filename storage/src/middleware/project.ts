import type { Request, Response, NextFunction } from 'express'
import { config } from '../config'
import { verifyToken } from '../services/auth'

export function projectMiddleware(req: Request, _res: Response, next: NextFunction) {
	const token = (req.headers['x-project-id'] || req.headers['project-id']) as string
	if (!token) {
		next(new Error('Project token is missing'))
		return
	}
	try {
		const payload = verifyToken(token, config.accountJwtSecret)
		const id = (payload.id || payload.projectId) as string
    ;(req as any).projectId = id
		next()
	} catch {
		next(new Error('Invalid project token'))
	}
}
