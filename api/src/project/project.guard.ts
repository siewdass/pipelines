import { Injectable, CanActivate, ExecutionContext, BadRequestException, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Request } from 'express'
import { Project } from './project.schema'
import { Model } from 'mongoose'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class ProjectGuard implements CanActivate {
	private readonly logger = new Logger(ProjectGuard.name)
	constructor(@InjectModel(Project.name, 'default') private readonly projectModel: Model<Project & mongoose.Document>) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request & { projectId?: string }>()
		const headers = request.headers as Record<string, string | string[] | undefined>
		
		const rawToken = headers['project-token'] || headers['project_token'] || headers['projecttoken']
		const projectToken = Array.isArray(rawToken) ? rawToken[0] : rawToken
		
		if (!projectToken || typeof projectToken !== 'string') {
			this.logger.warn('[PROJECT] Invalid or missing project-token header')
			throw new BadRequestException('Invalid or missing project-token')
		}

		try {
			const secret = process.env.USER_JWT_SECRET || 'dev-user-secret'
			const payload = jwt.verify(projectToken, secret) as any
			
			if (!payload.id) {
				throw new BadRequestException('Invalid project-token: no project id in payload')
			}

			request.projectId = payload.id
			request.headers['project-id'] = request.projectId
			return true
		} catch (error) {
			this.logger.error('[PROJECT] Project validation failed:', error.message)
			throw new BadRequestException('Invalid project-token')
		}
	}
}
