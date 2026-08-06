declare module 'socketcluster-server' {
	import type { Server as HttpServer } from 'http'
	import type { IncomingMessage } from 'http'

	export interface AGRequest {
		readonly id: string
		readonly procedureName: string
		data: any
		error: Error | null
		end(data?: any): void
		error(error: Error | string): void
	}

	export interface AGServerSocket {
		readonly id: string
		readonly authToken: any
		readonly request: IncomingMessage
		exchange: any
		listener(eventName: string): any
		procedure(name: string): any
		receiver(name: string): any
		transmit(event: string, data?: any, options?: any): Promise<void>
		invoke(event: string, data?: any, options?: any): Promise<any>
		subscribe(channelName: string, options?: any): any
		unsubscribe(channelName: string): Promise<void>
		disconnect(code?: number, reason?: string): void
		emit(eventName: string, data?: any): void
	}

	export interface AGServer {
		options: any
		exchange: any
		httpServer: HttpServer
		MIDDLEWARE_HANDSHAKE: string
		MIDDLEWARE_INBOUND: string
		MIDDLEWARE_INBOUND_RAW: string
		MIDDLEWARE_OUTBOUND: string
		listener(eventName: string): any
		on(eventName: string, handler: (...args: any[]) => void): this
		setMiddleware(type: string, middleware: (middlewareStream: any) => void): void
		close(keepSocketsOpen?: boolean): Promise<void>
	}

	export function attach(httpServer: HttpServer, options?: any): AGServer
	export function listen(port: number, options?: any, callback?: () => void): AGServer
}
