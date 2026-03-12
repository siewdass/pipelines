import { Controller, Post, Body, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { Project } from './project.schema'
import { CreateProjectDto } from './project.dto'

@Controller('project')
export class ProjectController {
	constructor(@InjectModel(Project.name, 'admin') private readonly projectModel: Model<Project & mongoose.Document>) {}

	@Post('create')
	async createProject(@Body() body: CreateProjectDto) {
		const { projectId, token, origin } = body

		try {

			if (token) {
				await this.projectModel.updateOne({ token }, { $set: { token, projectId, origin } }, { upsert: true })
			}

			return { ok: true }
		} catch (err) {
			throw new BadRequestException('failed to create project')
		}
	}
}