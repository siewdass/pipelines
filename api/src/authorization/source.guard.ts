import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common'
import { ProjectService } from '../project/project.service'

@Injectable()
export class SourceGuard implements CanActivate {
	private readonly protectedSources = [ 'user', 'users', 'role', 'roles', 'permission', 'permissions' ]
	private readonly logger = new Logger(SourceGuard.name)

	constructor(private readonly projectService: ProjectService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const source = request.body?.source
		const projectId = request.projectId
		const userId = request.userId

		if (!source || !projectId) return true

		const action = request.url.includes('/mutation/') ? 'write' : 'read'
		const payload = action === 'read' ? request.body?.output : request.body?.input

		// 1. Extraer todas las colecciones (raíz + anidadas)
		const requestedSources = new Set<string>([ source ])
		
		const traverse = (obj: any) => {
			if (!obj || typeof obj !== 'object') return
			for (const [ key, value ] of Object.entries(obj)) {
				if (action === 'read') {
					if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
						requestedSources.add(key)
						traverse(value)
					}
				} else {
					// write action maps Arrays and Objects to related collections
					if (Array.isArray(value)) {
						requestedSources.add(key)
						value.forEach(v => traverse(v))
					} else if (typeof value === 'object' && value !== null && value.constructor === Object) {
						requestedSources.add(key)
						traverse(value)
					}
				}
			}
		}

		if (payload) {
			if (action === 'write' && Array.isArray(payload)) {
				payload.forEach(item => traverse(item))
			} else {
				traverse(payload)
			}
		}

		const sourcesArray = Array.from(requestedSources)

		// 2. Bloquear en seco peticiones directas a colecciones hardcore-protegidas
		const systemViolations = sourcesArray.filter(s => this.protectedSources.includes(s.toLowerCase()))
		if (systemViolations.length > 0) {
			this.logger.warn(`Blocked access to protected core collections: ${systemViolations.join(', ')}`)
			throw new ForbiddenException(`Direct access to system collections (${systemViolations.join(', ')}) is restricted.`)
		}

		// 3. Consultar a la Base de Datos
		const { db } = await this.projectService.getProjectContext(projectId)
		const permissionsColl = db.collection('permissions')

		const protectedRules = await permissionsColl.find({ resources: { $in: sourcesArray }, [ action ]: true }).toArray()
		if (protectedRules.length === 0) {
			return true // Ninguna de las colecciones solicitadas tiene reglas de protección -> PUBLIC
		}

		const protectedSourcesInReq = new Set<string>()
		protectedRules.forEach(rule => {
			rule.resources.forEach((r: string) => {
				if (sourcesArray.includes(r)) protectedSourcesInReq.add(r)
			})
		})

		// Si llegamos aquí al menos 1 colección es privada
		if (!userId) {
			throw new ForbiddenException(`Unauthorized: Missing token for protected resources (${Array.from(protectedSourcesInReq).join(', ')})`)
		}

		const usersColl = db.collection('users')
		const rolesColl = db.collection('roles')

		const user = await usersColl.findOne({ _id: userId })
		if (!user || !user.roles || !user.roles.length) {
			throw new ForbiddenException('Forbidden: User has no roles for protected resources.')
		}

		const userRoles = await rolesColl.find({
			$or: [
				{ _id: { $in: user.roles } },
				{ name: { $in: user.roles } }
			]
		}).toArray()

		const permNamesOrIds = userRoles.flatMap((r: any) => r.permissions || [])
		if (!permNamesOrIds.length) {
			throw new ForbiddenException('Forbidden: User roles have no permissions.')
		}

		const grantedRules = await permissionsColl.find({
			$or: [
				{ _id: { $in: permNamesOrIds } },
				{ name: { $in: permNamesOrIds } }
			],
			[ action ]: true
		}).toArray()

		const permittedSources = new Set<string>()
		grantedRules.forEach(rule => {
			rule.resources.forEach((r: string) => permittedSources.add(r))
		})

		// 4. Validar que el usuario tenga acceso a TODAS las colecciones protegidas detectadas
		const missingAccess = Array.from(protectedSourcesInReq).filter(s => !permittedSources.has(s))
		if (missingAccess.length > 0) {
			throw new ForbiddenException(`Forbidden: Insufficient permissions for collections (${missingAccess.join(', ')})`)
		}

		return true
	}
}
