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

	generateToken(payload: any) {
		const secret = process.env.JWT_SECRET || 'dev-secret'
		return jwt.sign(payload, secret, { expiresIn: '7d' })
	}
}
