import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { getContext } from './db'

const BCRYPT_ROUNDS = 10

export function hashPassword(password: string) {
	return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export function comparePassword(password: string, hash: string) {
	return bcrypt.compare(password, hash)
}

export function generateToken(payload: Record<string, unknown>, type: 'user' | 'account') {
	const secret = type === 'user' ? config.userJwtSecret : config.accountJwtSecret
	return jwt.sign({ ...payload, type }, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string, secret: string) {
	return jwt.verify(token, secret) as Record<string, unknown>
}

export async function flattenPermissions(projectId: string, roleIds: string[]) {
	const { db } = await getContext(projectId)
	const roles = await db.collection('roles').find({ _id: { $in: roleIds } as any }).toArray()
	const permissionIds = roles.flatMap((r: any) => r.permissions || [])
	if (!permissionIds.length) return {}
	const permissions = await db.collection('permissions').find({ _id: { $in: permissionIds } as any }).toArray()
	const map: Record<string, { read: boolean; write: boolean }> = {}
	for (const p of permissions as any[]) {
		for (const res of p.resources || []) {
			if (!map[res]) map[res] = { read: false, write: false }
			if (p.read) map[res].read = true
			if (p.write) map[res].write = true
		}
	}
	return map
}
