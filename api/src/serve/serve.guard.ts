// import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common'
// import { Request } from 'express'
// import { InjectModel } from '@nestjs/mongoose'
// import { Model } from 'mongoose'
// import * as jwt from 'jsonwebtoken'
// import { Origin } from '../project/origin.schema'

// @Injectable()
// export class ServeGuard implements CanActivate {
// 	private readonly logger = new Logger(ServeGuard.name)

// 	constructor(
// 		@InjectModel(Origin.name, 'default') private readonly originModel: Model<Origin>
// 	) {}

// 	async canActivate(context: ExecutionContext): Promise<boolean> {
// 		const request = context.switchToHttp().getRequest<Request & { projectId?: string }>()
		
// 		const origin = request.headers.origin || request.headers.referer || request.headers.host || 'unknown-origin'
// 		this.logger.log(`[SERVE GUARD] Request from origin: ${origin}`)

// 		const requestedProjectToken = request.query['project-id'] as string
		
// 		if (!requestedProjectToken) {
// 			this.logger.warn('Missing project-id query parameter')
// 			throw new ForbiddenException('Missing project-id query parameter')
// 		}

// 		let decodedProjectId = ''
// 		try {
// 			const secret = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'
// 			const payload = jwt.verify(requestedProjectToken, secret) as { id?: string; projectId?: string }
// 			decodedProjectId = payload.projectId || payload.id || ''
// 			if (!decodedProjectId) throw new Error('Missing project ID in token payload')
// 		} catch {
// 			this.logger.warn('[SERVE GUARD] Signature mismatch, falling back to decoding for development')
// 			const payload = jwt.decode(requestedProjectToken) as { id?: string; projectId?: string }
// 			decodedProjectId = payload?.projectId || payload?.id || ''
// 			if (!decodedProjectId) throw new ForbiddenException('Invalid project token payload')
// 		}

// 		// Intentamos buscar el origin, pero no bloqueamos si no existe en desarrollo
// 		const originDoc = await this.originModel.findOne({ url: origin, projectId: decodedProjectId, status: 'active' }).exec()
// 		if (!originDoc) {
// 			this.logger.warn(`[SERVE GUARD] Origin ${origin} not registered for project ${decodedProjectId}. Allowing anyway (DEV MODE).`)
// 		}

// 		// Inyectamos el ID encontrado al Request object para el controller
// 		request.projectId = decodedProjectId
// 		this.logger.log(`[SERVE GUARD] Request processed for Project ID: ${request.projectId}`)
		
// 		return true
// 	}
// }
