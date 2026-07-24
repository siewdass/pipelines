import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config'

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
