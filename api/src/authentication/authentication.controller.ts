import { Controller, Post, Patch, Body, HttpException, HttpStatus, Headers, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { ProjectService } from '../project/project.service'
import { User, UserSchema } from './user.schema'
import { Account, AccountSchema } from '../account/account.schema'
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
	private readonly logger = new Logger(AuthenticationController.name)

	constructor(
		private readonly projectService: ProjectService,
		private readonly authService: AuthenticationService,
	) {}

	private async getAccountModel() {
		return await this.projectService.getProjectModel('default', AccountSchema, Account.name)
	}

	@Post('register')
	async register(@Headers('project-id') projectId: string, @Body() { email, password, name }: RegisterRequestDto): Promise<RegisterResponseDto> {
		const userModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const existingUser = await userModel.findOne({ email }).lean().exec()
		if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT)
		const newUser = new userModel({ email, password, name })
		await newUser.save()
		return { success: true, message: 'Register success' }
	}

	@Post('login')
	async login(@Headers('project-id') projectId: string, @Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto> {
		const userModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const foundUser = await this.authService.validateUser(userModel, email, password)
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

	@Post('account/register')
	async accountRegister(@Body() { email, password, name }: RegisterRequestDto): Promise<RegisterResponseDto> {
		try {
			const accountModel = await this.getAccountModel()
			const found = await accountModel.findOne({ email }).lean().exec()
			if (found) throw new HttpException('Account already exists', HttpStatus.CONFLICT)
			const rounds = 10
			const hashed = await bcrypt.hash(password, rounds)
			const created = new accountModel({ email, password: hashed, name })
			await created.save()
		} catch (err: unknown) {
			this.logger.error('[AUTH] Account Register Error:', err)
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Register success' }
	}

	@Post('account/login')
	async accountLogin(@Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto> {
		let token
		try {
			const accountModel = await this.getAccountModel()
			const found = await accountModel.findOne({ email }).exec()
			if (!found) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
			const match = await bcrypt.compare(password, found.password)
			if (!match) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
			token = this.authService.generateToken({ id: found._id, email: found.email }, 'account')
		} catch (err: unknown) {
			this.logger.error('[AUTH] Account Login Error:', err)
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Login success', token }
	}
}