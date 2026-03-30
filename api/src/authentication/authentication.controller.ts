import { Controller, Post, Patch, Body, HttpException, HttpStatus, Headers, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
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

	@Post('signup')
	async register(@Headers('project-id') projectId: string, @Body() { email, password, name }: RegisterRequestDto): Promise<RegisterResponseDto> {
		this.logger.log(`User registration attempt: ${email} (Project: ${projectId})`)
		const userModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const existingUser = await userModel.findOne({ email }).lean().exec()
		if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT)
		const newUser = new userModel({ email, password, name })
		await newUser.save()
		this.logger.log(`User registered successfully: ${newUser._id}`)
		return { success: true, message: 'Register success' }
	}

	@Post('signin')
	async login(@Headers('project-id') projectId: string, @Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto & { user: any }> {
		this.logger.log(`User login attempt: ${email}`)
		const userModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const foundUser = (await this.authService.validateUser(userModel, email, password)) as any
		const token = this.authService.generateToken({ id: foundUser._id, email: foundUser.email }, 'user')
		this.logger.log(`User login success: ${foundUser._id}`)

		// Fetch and Flatten Permissions
		const permissions = await this.getUserPermissions(projectId, foundUser.roles || [])

		return { 
			success: true, 
			message: 'Login success', 
			token,
			user: {
				id: foundUser._id,
				email: foundUser.email,
				name: foundUser.name,
				permissions
			}
		}
	}

	private async getUserPermissions(projectId: string, roleIds: string[]) {
		const roleModel = await this.projectService.getProjectModel(projectId, RoleSchema, Role.name)
		const permissionModel = await this.projectService.getProjectModel(projectId, PermissionSchema, Permission.name)
		
		const roles = await roleModel.find({ _id: { $in: roleIds } }).lean().exec()
		const permissionIds = roles.flatMap((r: any) => r.permissions || [])
		
		const permissionDocs = await permissionModel.find({ _id: { $in: permissionIds } }).lean().exec()
		
		const flattenMap: Record<string, { read: boolean, write: boolean }> = {}
		
		for (const p of permissionDocs as any[]) {
			for (const res of p.resources || []) {
				if (!flattenMap[res]) flattenMap[res] = { read: false, write: false }
				if (p.read) flattenMap[res].read = true
				if (p.write) flattenMap[res].write = true
			}
		}
		
		return flattenMap
	}

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