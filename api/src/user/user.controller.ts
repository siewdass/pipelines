import { Controller, Post, Patch, Get, Delete, Body, Param, HttpException, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common'
import { ProjectService } from '../project/project.service'
import { User, UserSchema } from './user.schema'
import { Role, RoleSchema } from './role.schema'
import { Permission, PermissionSchema } from './permission.schema'
import { CreateUserDto, UpdateUserDto } from './user.dto'
import { ProjectGuard } from '../project/project.guard'
import { UserAuthGuard } from '../authorization/user.guard'
import { Request } from 'express'

@Controller('user')
@UseGuards(ProjectGuard, UserAuthGuard)
export class UserController {
	private readonly logger = new Logger(UserController.name)
	constructor(private readonly projectService: ProjectService) {}

	// --- Permissions Management (most specific routes first) ---

	@Post('roles/permissions')
	async createPermission(@Req() req: Request & { projectId: string }, @Body() body: Record<string, unknown>) {
		const { projectId } = req
		this.logger.log(`Creating permission: ${body.name}`)
		try {
			const resources = body.resources as string[] || []
			if (resources.includes('*')) {
				throw new HttpException('Wildcard (*) resource is reserved for the initial all_access permission', HttpStatus.FORBIDDEN)
			}

			const PermissionModel = await this.projectService.getProjectModel(projectId, PermissionSchema, Permission.name)
			const exists = await PermissionModel.findOne({ name: body.name }).select('_id').lean().exec()
			if (exists) throw new HttpException('Permission already exists', HttpStatus.CONFLICT)
			const created = new PermissionModel(body)
			await created.save()
			return { success: true, id: created._id }
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
	}

	@Get('roles/permissions')
	async getAllPermissions(@Req() req: Request & { projectId: string }) {
		const { projectId } = req
		const PermissionModel = await this.projectService.getProjectModel(projectId, PermissionSchema, Permission.name)
		const list = await PermissionModel.find().lean().exec()
		return { success: true, permissions: list }
	}

	@Patch('roles/permissions/:id')
	async updatePermission(@Req() req: Request & { projectId: string }, @Param('id') id: string, @Body() body: Record<string, unknown>) {
		const { projectId } = req
		const PermissionModel = await this.projectService.getProjectModel(projectId, PermissionSchema, Permission.name)
		const updated = await PermissionModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean().exec()
		if (!updated) throw new HttpException('Permission not found', HttpStatus.NOT_FOUND)
		return { success: true, permission: updated }
	}

	@Delete('roles/permissions/:id')
	async deletePermission(@Req() req: Request & { projectId: string }, @Param('id') id: string) {
		const { projectId } = req
		const PermissionModel = await this.projectService.getProjectModel(projectId, PermissionSchema, Permission.name)
		await PermissionModel.findByIdAndDelete(id).exec()
		return { success: true }
	}

	// --- Roles Management ---

	@Post('roles')
	async createRole(@Req() req: Request & { projectId: string }, @Body() body: { name: string; description?: string; permissions?: string[] }) {
		const { projectId } = req
		this.logger.log(`Creating role: ${body.name}`)
		try {
			const RoleModel = await this.projectService.getProjectModel(projectId, RoleSchema, Role.name)
			const exists = await RoleModel.findOne({ name: body.name }).select('_id').lean().exec()
			if (exists) throw new HttpException('Role already exists', HttpStatus.CONFLICT)
			const created = new RoleModel(body)
			await created.save()
			return { success: true, id: created._id }
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err ?? 'Unknown')
			throw new HttpException(message, HttpStatus.BAD_REQUEST)
		}
	}

	@Get('roles')
	async getAllRoles(@Req() req: Request & { projectId: string }) {
		const { projectId } = req
		const RoleModel = await this.projectService.getProjectModel(projectId, RoleSchema, Role.name)
		const list = await RoleModel.find().lean().exec()
		return { success: true, roles: list }
	}

	@Patch('roles/:id')
	async updateRole(@Req() req: Request & { projectId: string }, @Param('id') id: string, @Body() body: Record<string, unknown>) {
		const { projectId } = req
		const RoleModel = await this.projectService.getProjectModel(projectId, RoleSchema, Role.name)
		const updated = await RoleModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean().exec()
		if (!updated) throw new HttpException('Role not found', HttpStatus.NOT_FOUND)
		return { success: true, role: updated }
	}

	@Delete('roles/:id')
	async deleteRole(@Req() req: Request & { projectId: string }, @Param('id') id: string) {
		const { projectId } = req
		const RoleModel = await this.projectService.getProjectModel(projectId, RoleSchema, Role.name)
		await RoleModel.findByIdAndDelete(id).exec()
		return { success: true }
	}

	// --- Users Management (dynamic :id routes last) ---

	@Post()
	async create(@Req() req: Request & { projectId: string }, @Body() body: CreateUserDto) {
		const { projectId } = req
		this.logger.log(`Creating user: ${body.email} (Project: ${projectId})`)
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

	@Get()
	async getAll(@Req() req: Request & { projectId: string }) {
		const { projectId } = req
		this.logger.log(`Listing all users for project: ${projectId}`)
		const UserModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const list = await UserModel.find().select('-password').lean().exec()
		return { success: true, users: list }
	}

	@Get(':id')
	async getById(@Req() req: Request & { projectId: string }, @Param('id') id: string) {
		const { projectId } = req
		const UserModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		const found = await UserModel.findById(id).select('-password').lean().exec()
		if (!found) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
		return { success: true, user: found }
	}

	@Patch(':id')
	async update(@Req() req: Request & { projectId: string }, @Param('id') id: string, @Body() body: UpdateUserDto) {
		const { projectId } = req
		this.logger.log(`Updating user: ${id}`)
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

	@Delete(':id')
	async deleteUser(@Req() req: Request & { projectId: string }, @Param('id') id: string) {
		const { projectId } = req
		this.logger.log(`Deleting user: ${id}`)
		const UserModel = await this.projectService.getProjectModel(projectId, UserSchema, User.name)
		await UserModel.findByIdAndDelete(id).exec()
		return { success: true }
	}
}
