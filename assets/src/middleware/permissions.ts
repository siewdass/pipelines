import type { Request, Response, NextFunction } from 'express'

export type PermissionsMap = Record<string, { read?: boolean; write?: boolean }>

export function hasPermission(perms: PermissionsMap | undefined, resource: string, access: 'read' | 'write') {
	return !!(perms?.[resource]?.[access] || perms?.['*']?.[access])
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
	if (!(req as any).user) {
		res.status(401).json({ error: 'Authentication required' })
		return
	}
	next()
}

export function requirePermission(resource: string, access: 'read' | 'write') {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user as { permissions?: PermissionsMap } | null
		if (!user || !hasPermission(user.permissions, resource, access)) {
			res.status(403).json({ error: `Permission denied: ${resource}:${access}` })
			return
		}
		next()
	}
}
