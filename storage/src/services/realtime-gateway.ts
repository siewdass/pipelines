import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { getContext } from './db'
import { RealtimeService } from './realtime'

export function setupRealtime(httpServer: HttpServer) {
	const io = new Server(httpServer, {
		cors: {
			origin: '*',
			methods: [ 'GET', 'POST' ],
			credentials: true,
		},
		transports: [ 'polling' ],
		allowEIO3: true,
	})

	const realtimeService = new RealtimeService()

	io.on('connection', async (client: Socket) => {
		const { projectToken, userToken } = client.handshake.auth

		if (!projectToken) {
			client.disconnect()
			return
		}

		try {
			let projectId: string
			try {
				const projectPayload = jwt.verify(projectToken, config.accountJwtSecret) as { id: string; projectId?: string }
				projectId = projectPayload.id || projectPayload.projectId || ''
			} catch {
				const decoded = jwt.decode(projectToken) as { id?: string; projectId?: string }
				if (!decoded?.id && !decoded?.projectId) throw new Error('Invalid project token payload')
				projectId = decoded.id || decoded.projectId || ''
			}

			client.data.projectId = projectId
			client.join(`project:${projectId}`)

			if (userToken) {
				try {
					const userPayload: any = jwt.verify(userToken, config.userJwtSecret)
					const userId = userPayload.id
					client.data.userId = userId
					client.join(`user:${userId}`)
				} catch (err) {
					// Invalid userToken, connecting as anonymous
				}
			}

			console.log(`[Realtime] Client ${client.id} connected to project ${projectId}`)
		} catch (error: any) {
			console.error(`[Realtime] Connection failed: ${error.message}`)
			client.disconnect()
		}
	})

	io.on('connection', (client: Socket) => {
		client.on('subscribe', async (data: { channel: string; source?: string }) => {
			const { channel, source } = data
			if (source && realtimeService.isProtectedSource(source)) return

			const roomName = realtimeService.buildRoomName(source, channel)
			client.join(roomName)

			if (source) {
				try {
					const projectId = client.data.projectId
					const { db } = await getContext(projectId)
					const recentData = await realtimeService.fetchRecent(db, source, roomName)
					if (recentData && recentData.length > 0) {
						client.emit(source, recentData)
					}
				} catch (err: any) {
					console.error(`[Realtime] Error fetching recent data: ${err.message}`)
				}
			}
		})

		client.on('unsubscribe', (data: { channel: string; source?: string }) => {
			const { channel, source } = data
			const roomName = realtimeService.buildRoomName(source, channel)
			client.leave(roomName)
		})

		client.on('publish', async (payload: { channel: string; input: any; source?: string }) => {
			const { channel, input, source } = payload
			if (source && realtimeService.isProtectedSource(source)) return

			const projectId = client.data.projectId
			const userId = client.data.userId
			const roomName = realtimeService.buildRoomName(source, channel)

			let persistedData = input
			if (source) {
				try {
					const { db } = await getContext(projectId)
					persistedData = await realtimeService.saveAndPrune(db, source, roomName, input, userId)
				} catch (err: any) {
					console.error(`[Realtime] Could not connect to project database: ${err.message}`)
				}
			}

			const eventName = source || channel
			io.to(roomName).emit(eventName, persistedData)
		})

		client.on('refresh', (source: string) => {
			const projectId = client.data.projectId
			io.to(`project:${projectId}`).emit(`refresh:${source}`)
		})
	})

	return io
}
