import { Controller, Post, Body, BadRequestException, UseGuards, Req, Get, Param, Patch, NotFoundException, Delete } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { ProjectService } from './project.service'
import { User, UserSchema } from '../user/user.schema'
import { Project } from './project.schema'
import { CreateProjectDto } from './project.dto'
import { AccountAuthGuard } from '../authorization/account.guard'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

import { Origin } from './origin.schema'
import { EmailSetting } from './email-setting.schema'

@Controller('project')
@UseGuards(AccountAuthGuard)
export class ProjectController {
	constructor(
		@InjectModel(Project.name, 'default') private readonly projectModel: Model<Project & mongoose.Document>,
		@InjectModel(Origin.name, 'default') private readonly originModel: Model<Origin & mongoose.Document>,
		@InjectModel(EmailSetting.name, 'default') private readonly emailSettingModel: Model<EmailSetting & mongoose.Document>,
		private readonly projectService: ProjectService
	) {}

	@Post('create')
	async createProject(@Req() req: Request & { accountId: string }, @Body() body: CreateProjectDto) {
		const { accountId } = req
		const _id = uuidv4()
		const secret = process.env.USER_JWT_SECRET || 'dev-user-secret'
		// Include project id in token for traceability
		const token = jwt.sign({ id: _id, accountId }, secret)

		try {
			const project = await this.projectModel.create({
				...body,
				_id,
				accountId,
				token,
				status: 'active'
			})

			// Create anonymous user in the new project database
			const userModel = await this.projectService.getProjectModel(_id, UserSchema, User.name)
			await userModel.create({
				email: 'anonymous@anonymous.com',
				name: 'Anonymous',
				firstLogin: false
			})

			return { ...project.toObject(), message: 'Project created successfully' }
		} catch (error) {
			console.error(error)
			throw new BadRequestException('failed to create project')
		}
	}

	@Get('list')
	async listProjects(@Req() req: Request & { accountId: string }) {
		const { accountId } = req
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

	@Patch(':id/token')
	async regenerateToken(@Req() req: Request & { accountId: string }, @Param('id') id: string) {
		const { accountId } = req
		const secret = process.env.USER_JWT_SECRET || 'dev-user-secret'
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
	async updateStatus(@Req() req: Request & { accountId: string }, @Param('id') id: string, @Body() body: { status: string }) {
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
	async addOrigin(@Req() req: Request & { accountId: string }, @Param('id') id: string, @Body() body: { url: string }) {
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
	async saveEmailSettings(@Req() req: Request & { accountId: string }, @Param('id') id: string, @Body() body: { email: string, token: string }) {
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