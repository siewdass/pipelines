import { Controller, Post, Patch, Body, HttpException, HttpStatus, Headers, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { clc } from '../utils/colors'
import { ProjectService } from '../project/project.service'
import { User, UserSchema } from './user.schema'
import { Account, AccountSchema } from '../account/account.schema'
import { CreateAccountDto } from '../account/account.dto'
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
		this.logger.log(`${clc.cyan('User registration attempt:')} ${clc.yellow(email)} ${clc.gray(`(Project: ${projectId})`)}`)
		const userModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const existingUser = await userModel.findOne({ email }).lean().exec()
		if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT)
		const newUser = new userModel({ email, password, name })
		await newUser.save()
		this.logger.log(`${clc.green('User registered successfully:')} ${clc.magenta(newUser._id)}`)
		return { success: true, message: 'Register success' }
	}

	@Post('login')
	async login(@Headers('project-id') projectId: string, @Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto> {
		this.logger.log(`${clc.cyan('User login attempt:')} ${clc.yellow(email)}`)
		const userModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const foundUser = await this.authService.validateUser(userModel, email, password)
		const token = this.authService.generateToken({ id: foundUser._id, email: foundUser.email }, 'user')
		this.logger.log(`${clc.green('User login success:')} ${clc.magenta(String(foundUser._id))}`)
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
	async accountRegister(@Body() { email, password, name }: CreateAccountDto): Promise<RegisterResponseDto> {
		try {
			const accountModel = await this.getAccountModel()
			const found = await accountModel.findOne({ email }).lean().exec()
			if (found) throw new HttpException('Account already exists', HttpStatus.CONFLICT)
			const rounds = 10
			const hashed = await bcrypt.hash(password, rounds)
			const created = new accountModel({ email, password: hashed, name })
			await created.save()
			this.logger.log(`${clc.green('Account registered successfully:')} ${clc.yellow(email)}`)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			this.logger.error(`${clc.red('Account Register Error:')} ${message}`)
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
			this.logger.log(`${clc.green('Account login success:')} ${clc.yellow(email)}`)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			this.logger.error(`${clc.red('Account Login Error:')} ${message}`)
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Login success', token }
	}
}