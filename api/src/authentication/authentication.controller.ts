import { Controller, Post, Patch, Body, HttpException, HttpStatus, Headers } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { ProjectService } from '../project/project.service'
import { User, UserSchema } from './user.schema'
import { Client, ClientSchema } from '../client/client.schema'
import { AuthenticationService } from './authentication.service'
import {
	RegisterRequestDto,
	RegisterResponseDto,
	LoginRequestDto,
	LoginResponseDto,
	RecoverRequestDto,
	RecoverResponseDto,
	ResetRequestDto,
	ResetResponseDto,
} from './authentication.dto'

@Controller('authentication')
export class AuthenticationController {
	constructor(
		private readonly projectService: ProjectService,
		private readonly authService: AuthenticationService,
	) {}

	private get clientModel() {
		const { connection } = this.projectService.getProjectContext('admin') // or 'default', depending on tenant structure, or pass it
		return connection.model<Client>(Client.name, ClientSchema)
	}

	@Post('register')
	async register(@Headers('project-id') projectId: string, @Body() { email, password, name }: RegisterRequestDto): Promise<RegisterResponseDto> {
		const { connection } = this.projectService.getProjectContext(projectId)
		const user = connection.model<User>(User.name, UserSchema)
		const existingUser = await user.findOne({ email }).lean().exec()
		if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT)
		const newUser = new user({ email, password, name })
		await newUser.save()
		return { success: true, message: 'Register success' }
	}

	@Post('login')
	async login(@Headers('project-id') projectId: string, @Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto> {
		const { connection } = this.projectService.getProjectContext(projectId)
		const user = connection.model<User>(User.name, UserSchema)
		const foundUser = await this.authService.validateUser(user, email, password)
		const token = this.authService.generateToken({ id: foundUser._id, email: foundUser.email }, 'user')
		return { success: true, message: 'Login success', token }
	}

	@Post('recover')
	async recover(@Body() _: RecoverRequestDto): Promise<RecoverResponseDto> {
		// Implement recover logic (e.g. send email)
		return { success: true, message: 'Recover success' }
	}

	@Patch('save')
	async save(@Body() _: RecoverRequestDto): Promise<RecoverResponseDto> {
		// Implement recover logic (e.g. send email)
		return { success: true, message: 'Recover success' }
	}

	@Post('reset')
	async reset(@Body() _: ResetRequestDto): Promise<ResetResponseDto> {
		// Implement reset logic
		return { success: true, message: 'Reset success' }
	}

	@Post('client/register')
	async clientRegister(@Body() { email, password, name }: RegisterRequestDto): Promise<RegisterResponseDto> {
		try {
			const found = await this.clientModel.findOne({ email }).lean().exec()
			if (found) throw new HttpException('Client already exists', HttpStatus.CONFLICT)
			const rounds = 10
			const hashed = await bcrypt.hash(password, rounds)
			const created = new this.clientModel({ email, password: hashed, name })
			await created.save()
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Register success' }
	}

	@Post('client/login')
	async clientLogin(@Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto> {
		let token
		try {
			const found = await this.clientModel.findOne({ email }).exec()
			if (!found) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
			const match = await bcrypt.compare(password, found.password)
			if (!match) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
			token = this.authService.generateToken({ id: found._id, email: found.email }, 'client')
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Login success', token }
	}
}