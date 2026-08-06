import { attach } from 'socketcluster-server'
import type { AGServer, AGServerSocket } from 'socketcluster-server'
import type { Server as HttpServer } from 'http'
import { config } from '../config'
import { isProtectedSource } from './protected'
import { saveAndPrune } from './persistence'
import { decodeId, decodeUserPayload } from './utils'
import { getSourceAccess, canAccess, type UserAccess } from './access'
import { getContext } from './db'

const socketProject = new WeakMap<AGServerSocket, string>()
const socketUser = new WeakMap<AGServerSocket, UserAccess>()

export function buildChannelName(projectId: string, source: string | undefined, channel: string): string {
	return `${projectId}:${source || ''}:${channel}`
}

export function parseChannelName(channelName: string): { projectId: string; source: string; channel: string } {
	const first = channelName.indexOf(':')
	if (first === -1) return { projectId: channelName, source: '', channel: '' }
	const second = channelName.indexOf(':', first + 1)
	if (second === -1) return { projectId: channelName.slice(0, first), source: channelName.slice(first + 1), channel: '' }
	return {
		projectId: channelName.slice(0, first),
		source: channelName.slice(first + 1, second),
		channel: channelName.slice(second + 1)
	}
}

export function setupRealtime(httpServer: HttpServer): AGServer {
	const agServer = attach(httpServer, {
		path: '/socketcluster/',
		origins: '*:*'
	})

	;(async () => {
		for await (const { socket } of agServer.listener('connection')) {
			handleAuthenticate(socket)
			handlePublish(agServer, socket)
			handleErrors(socket)
		}
	})()

	agServer.setMiddleware(agServer.MIDDLEWARE_INBOUND, (middlewareStream) => {
		;(async () => {
			for await (const action of middlewareStream) {
				if (action.type === 'subscribe') {
					const { projectId, source } = parseChannelName(action.channel)

					if (!projectId || projectId !== socketProject.get(action.socket)) {
						action.block(new Error('subscribe requires an authenticated project'))
						continue
					}
					if (source && isProtectedSource(source)) {
						action.block(new Error(`Source '${source}' is protected`))
						continue
					}
					if (source) {
						let allowed = false
						try {
							allowed = await checkAccess(projectId, source, socketUser.get(action.socket), 'read')
						} catch (err: any) {
							action.block(new Error(err?.message || 'access check failed'))
							continue
						}
						if (!allowed) {
							action.block(new Error(`Permission denied: ${source}:read`))
							continue
						}
					}
				}
				action.allow()
			}
		})()
	})

	return agServer
}

async function checkAccess(projectId: string, source: string, user: UserAccess | undefined, access: 'read' | 'write'): Promise<boolean> {
	const { db } = await getContext(projectId)
	const sourceAccess = await getSourceAccess(db, source)
	return canAccess(sourceAccess, user, source, access)
}

function handleAuthenticate(socket: AGServerSocket): void {
	;(async () => {
		for await (const request of socket.procedure('authenticate')) {
			const { projectToken, userToken } = request.data ?? {}

			if (projectToken) {
				const projectId = decodeId(projectToken, config.accountJwtSecret)
				if (projectId) socketProject.set(socket, projectId)
			}
			if (userToken) {
				const user = decodeUserPayload(userToken, config.userJwtSecret)
				if (user) socketUser.set(socket, user)
			}

			request.end({ ok: true, projectId: socketProject.get(socket) })
		}
	})()
}

function handlePublish(agServer: AGServer, socket: AGServerSocket): void {
	;(async () => {
		for await (const request of socket.procedure('publish')) {
			const { source, channel, input } = request.data ?? {}
			const projectId = socketProject.get(socket)

			if (!projectId || !channel) {
				request.error(new Error('publish requires an authenticated project'))
				continue
			}
			if (source && isProtectedSource(source)) {
				request.error(new Error(`Source '${source}' is protected`))
				continue
			}

			try {
				if (source && !(await checkAccess(projectId, source, socketUser.get(socket), 'write'))) {
					request.error(new Error(`Permission denied: ${source}:write`))
					continue
				}

				const channelName = buildChannelName(projectId, source, channel)
				let data = input
				if (source) {
					const saved = await saveAndPrune(projectId, channelName, source, input, socketUser.get(socket)?.id)
					if (saved) data = saved
				}
				await agServer.exchange.invokePublish(channelName, data)
				request.end({ ok: true })
			} catch (err: any) {
				request.error(new Error(err?.message || 'publish failed'))
			}
		}
	})()
}

function handleErrors(socket: AGServerSocket): void {
	;(async () => {
		for await (const { error } of socket.listener('error')) {
			console.error(`[Events] Socket error: ${error?.message || error}`)
		}
	})()
}
