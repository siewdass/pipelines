import type { Db } from '../types'

export type SourceAccess = 'public' | 'private'

export type PermissionsMap = Record<string, { read?: boolean; write?: boolean }>

export interface UserAccess {
	id: string
	permissions?: PermissionsMap
}

export async function getSourceAccess(db: Db, source: string): Promise<SourceAccess> {
	const doc = await db.collection('schemas').findOne({ _id: source as any })
	return doc?.access === 'private' ? 'private' : 'public'
}

export function hasPermission(perms: PermissionsMap | undefined, resource: string, access: 'read' | 'write'): boolean {
	return !!(perms?.[resource]?.[access] || perms?.['*']?.[access])
}

export function canAccess(sourceAccess: SourceAccess, user: UserAccess | undefined, source: string, access: 'read' | 'write'): boolean {
	if (sourceAccess !== 'private') return true
	return !!user && hasPermission(user.permissions, source, access)
}
