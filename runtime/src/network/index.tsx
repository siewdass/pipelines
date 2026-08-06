import axios from 'axios'
import { create } from 'socketcluster-client'
import type { AGClientSocket } from 'socketcluster-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// --- Global Constants ---

const getPipelines = () => (window as any).PIPELINES || {}

/**
 * 1. Axios Instances
 * Configured with automatic header injection for Pipeline Identity.
 * Each concern points to its own service endpoint (identity / data / assets).
 */
const injectHeaders = (config: any) => {
	const pipelines = getPipelines()
	const token = pipelines.token || localStorage.getItem('token')

	if (token) {
		config.headers.Authorization = `Bearer ${token}`
		config.headers['project-id'] = token
	}
	return config
}

export const api = axios.create({
	baseURL: getPipelines().storage || 'http://localhost:4001',
	headers: { 'Content-Type': 'application/json' },
})

export const authApi = axios.create({
	baseURL: getPipelines().identity || 'http://localhost:4010',
	headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(injectHeaders, (error) => Promise.reject(error))
authApi.interceptors.request.use(injectHeaders, (error) => Promise.reject(error))

/**
 * 2. SocketCluster Engine
 * Maintains a persistent full-duplex connection via websocket.
 */
export const buildChannelName = (projectId: string, source: string | undefined, channel: string): string =>
	source ? `${projectId}:${source}:${channel}` : `${projectId}::${channel}`

const decodeJwtPayload = (token: string): any => {
	const part = token.split('.')[1]
	return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
}

const getProjectId = (): string | undefined => {
	try {
		return decodeJwtPayload(getPipelines().token)?.projectId
	} catch {
		return undefined
	}
}

export { getProjectId }

const getSocketOptions = () => {
	const url = new URL(getPipelines().events || 'http://localhost:4013')
	return {
		hostname: url.hostname,
		port: url.port || (url.protocol === 'https:' ? '443' : '80'),
		secure: url.protocol === 'https:',
		path: url.pathname === '/' ? '/socketcluster/' : url.pathname,
	}
}

export const socket: AGClientSocket = create({
	...getSocketOptions(),
	autoConnect: false, // Desactivado por defecto para evitar ruido al inicio
	autoReconnect: true,
	autoReconnectOptions: {
		initialDelay: 1000,
		randomness: 0,
		multiplier: 1.5,
		maxDelay: 30000,
	},
	ackTimeout: 10000,
})

/**
 * Invokes the authenticate RPC with the current project/user tokens.
 * The server decodes them to route publishes and attribute users.
 */
const authenticate = (userToken?: string | null) => {
	const pipelines = getPipelines()
	return socket.invoke('authenticate', {
		projectToken: pipelines.token,
		userToken: userToken !== undefined ? userToken : localStorage.getItem('token'),
	})
}

/**
 * Reconnects/authenticates the socket with updated credentials.
 * Returns a promise that resolves once the socket is authenticated.
 * acts as a LAZY activator and is idempotent between hooks.
 */
let authInFlight: Promise<void> | null = null

export const reconnect = (userToken?: string | null): Promise<void> => {
	const send = () =>
		authenticate(userToken).then(
			() => {},
			(err: any) => {
				console.error('[REALTIME] authenticate failed:', err?.message || err)
			}
		)

	if (authInFlight) return authInFlight

	authInFlight = new Promise<void>((resolve) => {
		const run = () => {
			send().then(() => {
				authInFlight = null
				resolve()
			})
		}

		if (socket.state === 'open') {
			run()
		} else if (socket.state === 'connecting') {
			socket.listener('connect').once().then(run).catch(() => {
				authInFlight = null
				resolve()
			})
		} else {
			socket.connect()
			console.log('[REALTIME] Connecting data stream...')
			socket.listener('connect').once().then(run).catch(() => {
				authInFlight = null
				resolve()
			})
		}
	})

	return authInFlight
}

/**
 * 3. Cache & Providers
 */
export const queryClient = new QueryClient()

// Generic Logging handlers
const setupSocketLogs = (socket: AGClientSocket) => {
	socket.listener('connect').once().then(() => console.log('[REALTIME] Connection established:', socket.id)).catch(() => {})
	socket.listener('disconnect').once().then(({ code, reason }: any) => console.log('[REALTIME] Connection lost', code, reason)).catch(() => {})
}

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	React.useEffect(() => {
		setupSocketLogs(socket)

		// NOT MORE AUTO-CONNECT HERE!
		// Connection happens only when hooks are used via reconnect()

		return () => {
			socket.disconnect()
		}
	}, [])

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// 2. Data Management Submodules (Flatly exported)
export * from './inquiry'
export * from './mutation'
export * from './subscription'
export * from './publish'
export * from './authentication'
export * from './can'
