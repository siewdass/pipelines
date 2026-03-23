import { Injectable, CanActivate, ExecutionContext, BadRequestException, Logger } from '@nestjs/common'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class ProjectGuard implements CanActivate {
	private readonly logger = new Logger(ProjectGuard.name)

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request & { projectId?: string }>()
		
		/**
		 * Identificador Único del Proyecto (Token) envíado mediante X-Project-Id (o X-Pipeline-Id).
		 * Este guard solo valida la pertenencia y validez del token del proyecto, no la autenticación del usuario.
		 */
		const projectToken = (request.headers['x-project-id'] || request.headers['x-pipeline-id']) as string

		if (!projectToken) {
			this.logger.warn('[PROJECT] Project Token (X-Project-Id is missing')
			throw new BadRequestException('Project Token is missing')
		}

		try {
			// El secreto con el que se firmaron los tokens de proyecto
			const secret = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'
			const payload = jwt.verify(projectToken, secret) as any
			
			if (!payload.id) {
				this.logger.error('[PROJECT] Invalid project token: missing id in payload')
				throw new BadRequestException('Invalid project token')
			}

			// Inyectamos el ID real del proyecto para que los servicios lo usen como contexto de base de datos
			request.projectId = payload.id
			
			this.logger.log(`[PROJECT GUARD] Project identity established: ${String(request.projectId)}`)
			
			return true
		} catch (error) {
			this.logger.error(`[PROJECT] Project token validation failed: ${error.message}`)
			throw new BadRequestException('Invalid or expired project-token')
		}
	}
}
