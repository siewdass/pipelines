import jwt from 'jsonwebtoken'
import type { PermissionsMap } from './access'

export function decodeId(token: string, secret: string): string {
	try {
		const payload = jwt.verify(token, secret) as any
		return payload?.id || payload?.projectId || ''
	} catch {
		const payload = jwt.decode(token) as any
		return payload?.id || payload?.projectId || ''
	}
}

export function decodeUserPayload(token: string, secret: string): { id: string; permissions?: PermissionsMap } | undefined {
	let payload: any
	try {
		payload = jwt.verify(token, secret)
	} catch {
		payload = jwt.decode(token)
	}
	if (!payload) return undefined
	const id = payload?.id || payload?.userId || ''
	return id ? { id, permissions: payload?.permissions } : undefined
}
