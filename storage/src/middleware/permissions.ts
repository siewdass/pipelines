import type { Request } from 'express'

export type PermissionsMap = Record<string, { read?: boolean; write?: boolean }>

export function hasPermission(perms: PermissionsMap | undefined, resource: string, access: 'read' | 'write') {
	return !!(perms?.[resource]?.[access] || perms?.['*']?.[access])
}

export function getUser(req: Request): { permissions?: PermissionsMap } | null {
	return (req as any).user ?? null
}
