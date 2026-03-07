import { Controller, Post, Patch, Body, HttpException, HttpStatus } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Client } from './client.schema'
import { AuthenticationService } from '../authentication/authentication.service'
import { RegisterRequestDto, RegisterResponseDto, LoginRequestDto, LoginResponseDto } from '../authentication/authentication.dto'

@Controller('client')
export class ClientController {
	constructor(
		private readonly authService: AuthenticationService,
		@InjectModel(Client.name) private readonly client: Model<Client>,
	) {}

	@Post('register')
	async register(@Body() { email, password, name }: RegisterRequestDto): Promise<RegisterResponseDto> {
		try {
			const found = await this.client.findOne({ email }).lean().exec()
			if (found) throw new HttpException('Client already exists', HttpStatus.CONFLICT)
			const rounds = Number(process.env.BCRYPT_ROUNDS) || 10
			const hashed = await bcrypt.hash(password, rounds)
			const created = new this.client({ email, password: hashed, name })
			await created.save()
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Register success' }
	}

	@Post('login')
	async login(@Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto> {
		let token
		try {
			const found = await this.client.findOne({ email }).exec()
			if (!found) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
			const match = await bcrypt.compare(password, found.password)
			if (!match) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
			token = this.authService.generateToken({ id: found._id, email: found.email })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Login success', token }
	}

}