import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Request } from 'express'
import { Project } from './project.schema'
import { Model } from 'mongoose'

@Injectable()
export class ProjectGuard implements CanActivate {
	constructor(@InjectModel(Project.name, 'admin') private readonly projectModel: Model<Project & mongoose.Document>) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request & { projectId?: string }>()
		const headers = request.headers as Record<string, string | string[] | undefined>
		
		const rawToken = headers['project-token'] || headers['project_token'] || headers['projecttoken']
		const projectToken = Array.isArray(rawToken) ? rawToken[0] : rawToken
		
		if (!projectToken || typeof projectToken !== 'string') {
			throw new BadRequestException('Invalid or missing project-token')
		}

		try {
			// Use the injected model bound to the 'admin' connection
			const doc = await this.projectModel.findOne({ token: projectToken }).lean().exec()
			if (!doc) {
				throw new BadRequestException('Invalid project-token')
			}
			request.projectId = (doc as unknown as { projectId?: string }).projectId
			// También podemos asegurarnos de que el controller pueda leerlo por inyección normal si usan el header
			request.headers['project-id'] = request.projectId
			return true
		} catch (err) {
			throw new BadRequestException('Invalid or missing project-token')
		}
	}
}
