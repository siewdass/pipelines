import { Controller, Post, Patch, Body, HttpException, HttpStatus, Headers, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { ProjectService } from '../project/project.service'
import { User, UserSchema } from '../user/user.schema'
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
import { Role, RoleSchema } from '../user/role.schema'
import { Permission, PermissionSchema } from '../user/permission.schema'

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

	private resolveProjectId(token: string): string {
		const secret = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'
		const payload = jwt.verify(token, secret) as { projectId?: string; id?: string }
		return payload.projectId || payload.id || token
	}

	// @Post('signup')
	// async register(...) { ... }

	// @Post('signin')
	// async login(...) { ... }

	// private async getUserPermissions(...) { ... }

	@Post('recover')
	async recover(@Body() _: RecoverRequestDto): Promise<RecoverResponseDto> {
		return { success: true, message: 'Recover success' }
	}

	@Patch('save')
	async save(@Body() _: RecoverRequestDto): Promise<RecoverResponseDto> {
		return { success: true, message: 'Recover success' }
	}

	@Post('reset')
	async reset(@Body() _: ResetRequestDto): Promise<ResetResponseDto> {
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
			this.logger.log(`Account registered successfully: ${email}`)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			this.logger.error(`Account Register Error: ${message}`)
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
			this.logger.log(`Account login success: ${email}`)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			this.logger.error(`Account Login Error: ${message}`)
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
		return { success: true, message: 'Login success', token }
	}
}