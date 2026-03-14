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
		const request = context.switchToHttp().getRequest<Request & { projectId?: string; accountId?: string }>()
		
		// If AccountAuthGuard already passed, we can take the project ID from a header
		if (request.accountId) {
			const headerProjectId = request.headers['x-project-id'] as string
			if (headerProjectId) {
				request.projectId = headerProjectId
				return true
			}
		}

		const authorization = request.headers.authorization
		const token = authorization?.replace('Bearer ', '').trim()
		
		if (!token) {
			this.logger.warn('[PROJECT] Authorization token is missing')
			throw new BadRequestException('Authorization token is missing')
		}

		try {
			const secret = process.env.USER_JWT_SECRET || 'dev-user-secret'
			const payload = jwt.verify(token, secret) as any
			
			if (!payload.id) {
				// If it's an account token being used where ProjectGuard is required, 
				// we still need a way to know the project id.
				const headerProjectId = request.headers['x-project-id'] as string
				if (headerProjectId) {
					request.projectId = headerProjectId
					return true
				}
				throw new BadRequestException('Invalid token: no project id (id) in payload and no x-project-id header')
			}

			request.projectId = payload.id
			this.logger.log(`[PROJECT GUARD] Extracted projectId: ${request.projectId}`)
			return true
		} catch (error) {
			// Fallback: Si falló la verificación con USER_SECRET, tal vez sea un token de cuenta
			// pero AccountAuthGuard ya debería haberlo manejado si estaba presente.
			const headerProjectId = request.headers['x-project-id'] as string
			if (headerProjectId && request.accountId) {
				request.projectId = headerProjectId
				return true
			}

			this.logger.error(`[PROJECT] Project validation failed: ${error.message}`)
			throw new BadRequestException('Invalid or expired project-token')
		}
	}
}
