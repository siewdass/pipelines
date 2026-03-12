import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Model } from 'mongoose'
import { User } from './user.schema'
import jwt from 'jsonwebtoken'

@Injectable()
export class AuthenticationService {
	constructor() {}

	// Accept a tenant-scoped User model
	async validateUser(userModel: Model<User>, email: string, password: string) {
		const user = await userModel.findOne({ email, password }).lean().exec()
		if (!user) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
		return user as any
	}

	generateToken(payload: any, type: 'user' | 'client') {
		const secret = type === 'user' 
			? process.env.USER_JWT_SECRET || 'dev-user-secret'
			: process.env.CLIENT_JWT_SECRET || 'dev-client-secret'
			
		const enrichedPayload = { ...payload, type }
		return jwt.sign(enrichedPayload, secret, { expiresIn: '7d' })
	}
}
