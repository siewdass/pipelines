import { Controller, Post, Patch, Get, Body, Param, HttpException, HttpStatus, Headers, Logger } from '@nestjs/common'
import { clc } from '../utils/colors'
import { ProjectService } from '../project/project.service'
import { User, UserSchema, Role, RoleSchema, Permission, PermissionSchema } from './user.schema'
import { CreateUserDto, UpdateUserDto } from './user.dto'

@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name)
	constructor(private readonly projectService: ProjectService) {}

	@Post()
	async create(@Headers('project-id') projectId: string, @Body() body: CreateUserDto) {
		this.logger.log(`${clc.cyan('Creating user:')} ${clc.yellow(body.email)} ${clc.gray(`(Project: ${projectId})`)}`)
		const UserModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
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
	async update(@Headers('project-id') projectId: string, @Param('id') id: string, @Body() body: UpdateUserDto) {
		this.logger.log(`${clc.cyan('Updating user:')} ${clc.magenta(id)}`)
		const UserModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
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
	async getById(@Headers('project-id') projectId: string, @Param('id') id: string) {
		const UserModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const found = await UserModel.findById(id).select('-password').lean().exec()
		if (!found) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
		return { success: true, user: found }
	}

	@Get()
	async getAll(@Headers('project-id') projectId: string) {
		this.logger.log(`${clc.cyan('Listing all users for project:')} ${clc.magenta(projectId)}`)
		const UserModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const list = await UserModel.find().select('-password').lean().exec()
		return { success: true, users: list }
	}

	@Post('roles')
	async createRole(@Headers('project-id') projectId: string, @Body() body: { name: string; description?: string }) {
		this.logger.log(`${clc.cyan('Creating role:')} ${clc.yellow(body.name)}`)
		try {
			const RoleModel = await this.projectService.getProjectModel(projectId, RoleSchema, Role.name)
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
	async createPermission(@Headers('project-id') projectId: string, @Body() body: { name: string; description?: string }) {
		try {
			const PermissionModel = await this.projectService.getProjectModel(projectId, PermissionSchema, Permission.name	)
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
