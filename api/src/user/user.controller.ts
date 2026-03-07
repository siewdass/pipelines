import { Controller, Post, Patch, Get, Body, Param, HttpException, HttpStatus, Headers } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { User, UserSchema, Role, RoleSchema, Permission, PermissionSchema } from './user.schema'
import { CreateUserDto, UpdateUserDto } from './user.dto'

@Controller('user')
export class UserController {
	constructor(private readonly databaseService: DatabaseService) {}

	@Post()
	async create(@Headers('db-name') dbName: string, @Body() body: CreateUserDto) {
		const UserModel = this.databaseService.getDbModel(dbName, UserSchema, User.name)
		try {
			const exists = await UserModel.findOne({ email: body.email }).select('_id').lean().exec()
			if (exists) throw new HttpException('User already exists', HttpStatus.CONFLICT)
			const created = new UserModel({ email: body.email, name: body.name, firstLogin: true })
			await created.save()
			return { success: true, id: created._id }
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
	}

	@Patch(':id')
	async update(@Headers('db-name') dbName: string, @Param('id') id: string, @Body() body: UpdateUserDto) {
		const UserModel = this.databaseService.getDbModel(dbName, UserSchema, User.name)
		try {
			const updated = await UserModel.findByIdAndUpdate(id, { $set: body }, { new: true }).select('-password').lean().exec()
			if (!updated) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
			return { success: true, user: updated }
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
	}

	@Get(':id')
	async getById(@Headers('db-name') dbName: string, @Param('id') id: string) {
		const UserModel = this.databaseService.getDbModel(dbName, UserSchema, User.name)
		const found = await UserModel.findById(id).select('-password').lean().exec()
		if (!found) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
		return { success: true, user: found }
	}

	@Get()
	async getAll(@Headers('db-name') dbName: string) {
		const UserModel = this.databaseService.getDbModel(dbName, UserSchema, User.name)
		const list = await UserModel.find().select('-password').lean().exec()
		return { success: true, users: list }
	}

	@Post('roles')
	async createRole(@Headers('db-name') dbName: string, @Body() body: { name: string; description?: string }) {
		try {
			const RoleModel = this.databaseService.getDbModel(dbName, RoleSchema, Role.name)
			const exists = await RoleModel.findOne({ name: body.name }).select('_id').lean().exec()
			if (exists) throw new HttpException('Role already exists', HttpStatus.CONFLICT)
			const created = new RoleModel({ name: body.name, description: body.description })
			await created.save()
			return { success: true, id: created._id }
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
	}

	@Post('roles/permissions')
	async createPermission(@Headers('db-name') dbName: string, @Body() body: { name: string; description?: string }) {
		try {
			const PermissionModel = this.databaseService.getDbModel(dbName, PermissionSchema, Permission.name	)
			const exists = await PermissionModel.findOne({ name: body.name }).select('_id').lean().exec()
			if (exists) throw new HttpException('Permission already exists', HttpStatus.CONFLICT)
			const created = new PermissionModel({ name: body.name, description: body.description })
			await created.save()
			return { success: true, id: created._id }
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
	}
}
