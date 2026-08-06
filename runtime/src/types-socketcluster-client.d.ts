declare module 'socketcluster-client' {
	export interface AGClientSocket {
		readonly id: string
		state: string
		connect(): void
		disconnect(code?: number, reason?: string): void
		subscribe(channelName: string, options?: any): any
		unsubscribe(channelName: string): Promise<void>
		invoke(event: string, data?: any, options?: any): Promise<any>
		transmit(event: string, data?: any, options?: any): void
		emit(eventName: string, data?: any): void
		listener(eventName: string): any
		receiver(name: string): any
		procedure(name: string): any
	}

	export function create(options?: any): AGClientSocket
}
