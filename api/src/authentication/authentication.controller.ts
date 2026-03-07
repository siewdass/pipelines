import { Controller, Post, Patch, Body, HttpException, HttpStatus, Headers } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { User, UserSchema } from './user.schema'
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
		private readonly dbService: DatabaseService,
		private readonly authService: AuthenticationService,
	) {}

	@Post('register')
	async register(@Headers('db-name') dbName: string, @Body() { email, password, name }: RegisterRequestDto): Promise<RegisterResponseDto> {
		const { connection } = this.dbService.getDbContext(dbName)
		const user = connection.model<User>(User.name, UserSchema)
		const existingUser = await user.findOne({ email }).lean().exec()
		if (existingUser) throw new HttpException('User already exists', HttpStatus.CONFLICT)
		const newUser = new user({ email, password, name })
		await newUser.save()
		return { success: true, message: 'Register success' }
	}

	@Post('login')
	async login(@Headers('db-name') dbName: string, @Body() { email, password }: LoginRequestDto): Promise<LoginResponseDto> {
		const { connection } = this.dbService.getDbContext(dbName)
		const user = connection.model<User>(User.name, UserSchema)
		const foundUser = await this.authService.validateUser(user, email, password)
		const token = this.authService.generateToken({ id: foundUser._id, email: foundUser.email })
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
}