import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { RealtimeService } from './realtime.service'

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server

	private logger: Logger = new Logger('RealtimeGateway')

	constructor(private readonly realtimeService: RealtimeService) {}

	// JWT Secrets from environment
	private readonly accountSecret = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'
	private readonly userSecret = process.env.USER_JWT_SECRET || 'dev-user-secret'

	/**
	 * Handle incoming connections and validate dual-token JWTs.
	 * Assigns the client to project and user rooms.
	 */
	async handleConnection(client: Socket) {
		const { projectToken, userToken } = client.handshake.auth

		if (!projectToken) {
			this.logger.error('No projectToken provided. Disconnecting.')
			client.disconnect()
			return
		}

		try {
			// 1. Validate mandatory Project Token
			const projectPayload: any = jwt.verify(projectToken, this.accountSecret)
			const projectId = projectPayload.id

			// Store metadata in socket
			client.data.projectId = projectId

			// Join base project room (for shared updates/broadcasts)
			client.join(`project:${projectId}`)

			// 2. Validate optional User Token
			if (userToken) {
				try {
					const userPayload: any = jwt.verify(userToken, this.userSecret)
					const userId = userPayload.id
					
					client.data.userId = userId

					// Join personal room (for direct messages/notifications)
					client.join(`user:${userId}`)
					this.logger.log(`User ${userId} identified and joined private room.`)
				} catch (err) {
					this.logger.warn('Invalid userToken. Connecting as anonymous.')
				}
			}

			this.logger.log(`Client ${client.id} connected to project ${projectId}`)

		} catch (error) {
			this.logger.error(`Connection failed: ${error.message}`)
			client.disconnect()
		}
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`)
	}

	/**
	 * 1. Subscribe (Join a Room)
	 * Assigns the client to a dynamic room based on source and options.
	 */
	@SubscribeMessage('subscribe')
	handleSubscribe(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { source: string; options?: any }
	) {
		// Example: room:chat:general or room:fleet:camion_1
		const roomName = this.realtimeService.buildRoomName(data.source, data.options)
		client.join(roomName)
		this.logger.log(`Client ${client.id} subscribed to ${roomName}`)
	}

	/**
	 * 2. Unsubscribe (Leave a Room)
	 */
	@SubscribeMessage('unsubscribe')
	handleUnsubscribe(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { source: string; options?: any }
	) {
		const roomName = this.realtimeService.buildRoomName(data.source, data.options)
		client.leave(roomName)
		this.logger.log(`Client ${client.id} unsubscribed from ${roomName}`)
	}

	/**
	 * 3. Publish (Direct Messaging / Events)
	 * Routes messages based on source and options.
	 */
	@SubscribeMessage('publish')
	async handlePublish(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { source: string; input: any; options?: any }
	) {
		const { source, input, options } = payload
		const projectId = client.data.projectId
		const userId = client.data.userId

		// 1. Determinar el destino / Sala
		let roomName = ''
		if (source === 'user' && options?.to) {
			roomName = `user:${options.to}`
		} else {
			roomName = this.realtimeService.buildRoomName(source, options)
		}

		// 2. Persistencia y Poda (Sliding Window) 
		// Si es una señal muy volátil (sin source o con flag explicit), saltaría. Pero por defecto, publicamos en "source".
		const persistedData = source 
			? await this.realtimeService.saveAndPrune(projectId, source, roomName, input, userId) 
			: input

		// 3. Emisión directa inteligente
		if (source === 'user' && options?.to) {
			this.server.to(roomName).emit('user', persistedData)
			this.logger.log(`User ${userId} published DM to ${options.to}`)
		} else {
			this.server.to(roomName).emit(source, persistedData)
			this.logger.log(`Client ${client.id} published to ${roomName}`)
		}
	}

	/**
	 * 4. Refresh Signal (High-speed invalidation)
	 * Lightweight event that broadcasts a refresh signal to the entire project.
	 */
	@SubscribeMessage('refresh')
	handleRefresh(@ConnectedSocket() client: Socket, @MessageBody() source: string) {
		const projectId = client.data.projectId
		this.server.to(`project:${projectId}`).emit(`refresh:${source}`)
		this.logger.log(`Project-wide refresh signal for source: ${source}`)
	}

}
