import type { Request, Response, NextFunction } from 'express'
import { config } from '../config'
import { verifyToken } from '../services/auth'

export function projectMiddleware(req: Request, res: Response, next: NextFunction) {
	const token = (req.headers['x-project-id'] || req.headers['project-id']) as string
	if (!token) {
		res.status(401).json({ error: 'Project token is missing' })
		return
	}
	try {
		const payload = verifyToken(token, config.accountJwtSecret)
		const id = (payload.id || payload.projectId) as string
		;(req as any).projectId = id
		next()
	} catch {
		res.status(401).json({ error: 'Invalid project token' })
	}
}
