import { Controller, Post, Body, BadRequestException, UseGuards, Req, Get } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { Project } from './project.schema'
import { CreateProjectDto } from './project.dto'
import { AccountAuthGuard } from '../authorization/account.guard'
import { Request } from 'express'

@Controller('project')
@UseGuards(AccountAuthGuard)
export class ProjectController {
	constructor(@InjectModel(Project.name, 'default') private readonly projectModel: Model<Project & mongoose.Document>) {}

	@Post('create')
	async createProject(@Req() req: Request & { accountId: string }, @Body() body: CreateProjectDto) {
		const { projectId, token, origin } = body
		const { accountId } = req

		try {
			if (token) {
				await this.projectModel.updateOne(
					{ token }, 
					{ $set: { token, projectId, origin, accountId } }, 
					{ upsert: true }
				)
			}

			return { ok: true }
		} catch {
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
}