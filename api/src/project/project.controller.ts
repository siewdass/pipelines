import { Controller, Post, Body, BadRequestException, UseGuards, Req, Get, Param, Patch, NotFoundException, Delete, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { ProjectService } from './project.service'
import { User, UserSchema } from '../user/user.schema'
import { Role, RoleSchema } from '../user/role.schema'
import { Permission, PermissionSchema } from '../user/permission.schema'
import { Project } from './project.schema'
import { Account, AccountSchema } from '../account/account.schema'
import { CreateProjectDto, UpdateProjectStatusDto, AddOriginDto, SaveEmailSettingsDto } from './project.dto'
import { AccountAuthGuard } from '../authorization/account.guard'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

import { Origin } from './origin.schema'
import { EmailSetting } from './email-setting.schema'

@Controller('project')
@UseGuards(AccountAuthGuard)
export class ProjectController {
	private readonly logger = new Logger(ProjectController.name)

	constructor(
		@InjectModel(Project.name, 'default') private readonly projectModel: Model<Project & mongoose.Document>,
		@InjectModel(Origin.name, 'default') private readonly originModel: Model<Origin & mongoose.Document>,
		@InjectModel(EmailSetting.name, 'default') private readonly emailSettingModel: Model<EmailSetting & mongoose.Document>,
		@InjectModel(Account.name, 'default') private readonly accountModel: Model<Account & mongoose.Document>,
		private readonly projectService: ProjectService
	) {}

	@Post('create')
	async createProject(@Req() req: Request & { accountId: string }, @Body() body: CreateProjectDto) {
		const { accountId } = req
		const _id = uuidv4()
		const secret = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'
		// Include project id in token for traceability
		const token = jwt.sign({ projectId: _id, accountId }, secret)

		try {
			this.logger.log(`Creating project: ${body.name}`)
			
			// 1. Create the Project record
			const project = await this.projectModel.create({
				...body,
				_id,
				accountId,
				token,
				status: 'active'
			})

			// 2. Automatically register the creator's origin if present
			const originUrl = req.headers.origin as string
			if (originUrl) {
				await this.originModel.create({
					url: originUrl,
					projectId: _id,
					status: 'active'
				})
				this.logger.log(`Automatic origin registered: ${originUrl}`)
			}

			// 3. Initialize Project Security (Roles & Admin User)
			const RoleModel = await this.projectService.getProjectModel(_id, RoleSchema, Role.name)
			const PermissionModel = await this.projectService.getProjectModel(_id, PermissionSchema, Permission.name)
			const UserModel = await this.projectService.getProjectModel(_id, UserSchema, User.name)

			// 3a. Create the "*" (All Access) Permission
			const allPermission = await PermissionModel.create({
				name: 'all_access',
				description: 'Full administrative access (*) to all resources',
				read: true,
				write: true,
				resources: [ '*' ]
			})

			// 3b. Create the "admin" Role and link it to the "*" permission
			const adminRole = await RoleModel.create({
				name: 'admin',
				description: 'Project Administrator with full privileges',
				permissions: [ allPermission._id ]
			})

			// 4. Create the Admin User (The creator) in the project database
			const creatorAccount = await this.accountModel.findById(accountId).lean().exec()
			if (creatorAccount) {
				await UserModel.create({
					email: creatorAccount.email,
					name: creatorAccount.name,
					roles: [ adminRole._id ],
					firstLogin: false
				})
				this.logger.log(`Creator ${creatorAccount.email} registered as Admin in project database.`)
			}

			this.logger.log(`Project created successfully: ${_id}`)
			return { ...project.toObject(), message: 'Project created successfully' }
		} catch (error: any) {
			this.logger.error(`Failed to create project: ${error.message}`)
			throw new BadRequestException('failed to create project')
		}
	}

	@Get('list')
	async listProjects(@Req() req: Request & { accountId: string }) {
		const { accountId } = req
		this.logger.log(`Listing projects for account: ${accountId}`)
		try {
			const projects = await this.projectModel.find({ accountId }).lean().exec()
			return projects
		} catch {
			throw new BadRequestException('failed to list projects')
		}
	}

	@Get(':id')
	async getProject(@Req() req: Request & { accountId: string }, @Param('id') id: string) {
		const { accountId } = req
		const project = await this.projectModel.findOne({ _id: id, accountId }).lean().exec()
		if (!project) throw new NotFoundException('project not found')
		return project
	}

	@Get(':id/token')
	async getProjectToken(@Req() req: Request & { accountId: string }, @Param('id') id: string) {
		const { accountId } = req
		this.logger.log(`Retrieving token for project: ${id}`)								
		const project = await this.projectModel.findOne({ _id: id, accountId }).select('token').lean().exec()
		if (!project) throw new NotFoundException('project not found')
		return { token: project.token }
	}

	@Patch(':id/token')
	async regenerateToken(@Req() req: Request & { accountId: string }, @Param('id') id: string) {
		const { accountId } = req
		this.logger.log(`Regenerating token for project: ${id}`)
		const secret = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'
		// Include project id in token for traceability
		const token = jwt.sign({ id, accountId }, secret)
		const project = await this.projectModel.findOneAndUpdate(
			{ _id: id, accountId },
			{ $set: { token } },
			{ new: true }
		).lean().exec()
		if (!project) throw new NotFoundException('project not found')
		return { token, message: 'Token regenerated successfully' }
	}

	@Patch(':id/status')
	async updateStatus(@Req() req: Request & { accountId: string }, @Param('id') id: string, @Body() body: UpdateProjectStatusDto) {
		const { accountId } = req
		const project = await this.projectModel.findOneAndUpdate(
			{ _id: id, accountId },
			{ $set: { status: body.status } },
			{ new: true }
		).lean().exec()
		if (!project) throw new NotFoundException('project not found')
		return { status: project.status, message: 'Status updated successfully' }
	}

	@Get(':id/origins')
	async listOrigins(@Req() req: Request & { accountId: string }, @Param('id') id: string) {
		const { accountId } = req
		// Verify project ownership
		const project = await this.projectModel.findOne({ _id: id, accountId }).exec()
		if (!project) throw new NotFoundException('project not found')

		return this.originModel.find({ projectId: id }).lean().exec()
	}

	@Post(':id/origins')
	async addOrigin(@Req() req: Request & { accountId: string }, @Param('id') id: string, @Body() body: AddOriginDto) {
		const { accountId } = req
		const project = await this.projectModel.findOne({ _id: id, accountId }).exec()
		if (!project) throw new NotFoundException('project not found')

		const origin = await this.originModel.create({
			url: body.url,
			projectId: id,
			status: 'active'
		})
		return { ...origin.toObject(), message: 'Origin added successfully' }
	}

	@Delete(':id/origins/:originId')
	async removeOrigin(@Req() req: Request & { accountId: string }, @Param('id') id: string, @Param('originId') originId: string) {
		const { accountId } = req
		const project = await this.projectModel.findOne({ _id: id, accountId }).exec()
		if (!project) throw new NotFoundException('project not found')

		await this.originModel.deleteOne({ _id: originId, projectId: id })
		return { ok: true, message: 'Origin removed successfully' }
	}

	@Get(':id/email-settings')
	async getEmailSettings(@Req() req: Request & { accountId: string }, @Param('id') id: string) {
		const { accountId } = req
		const project = await this.projectModel.findOne({ _id: id, accountId }).exec()
		if (!project) throw new NotFoundException('project not found')

		const settings = await this.emailSettingModel.findOne({ projectId: id }).lean().exec()
		return settings || { email: '', token: '' }
	}

	@Post(':id/email-settings')
	async saveEmailSettings(@Req() req: Request & { accountId: string }, @Param('id') id: string, @Body() body: SaveEmailSettingsDto) {
		const { accountId } = req
		const project = await this.projectModel.findOne({ _id: id, accountId }).exec()
		if (!project) throw new NotFoundException('project not found')

		const settings = await this.emailSettingModel.findOneAndUpdate(
			{ projectId: id },
			{ email: body.email || '', token: body.token || '' },
			{ new: true, upsert: true }
		).lean().exec()

		return { ...settings, message: 'Email settings saved successfully' }
	}
}