import axios from 'axios'
import { io, Socket } from 'socket.io-client'

const BASE_URL = 'http://localhost:8000'

// 1. Axios Instance for HTTP requests
export const api = axios.create({
	baseURL: BASE_URL,
	headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
	(config) => {
		const pipelines = (window as any).PIPELINES
		const token = pipelines?.TOKEN || localStorage.getItem('token')
		
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
			config.headers['x-project-id'] = token
		}

		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

/**
 * 2. Socket.io Real-time Engine
 * Initialized with dual-token auto-detection.
 */
const getInitialAuth = () => {
	const pipelines = (window as any).PIPELINES
	return {
		projectToken: pipelines?.TOKEN,
		userToken: localStorage.getItem('token'),
	}
}

export const socket: Socket = io(BASE_URL, {
	auth: getInitialAuth(),
	autoConnect: true,
	reconnection: true,
	reconnectionDelay: 1000,
	reconnectionAttempts: 10,
})

/**
 * Updates the socket authentication and forces a reconnection.
 * Useful after login/logout events to identify the user.
 */
export const reconnect = (userToken?: string | null) => {
	const pipelines = (window as any).PIPELINES
	
	// Update instance credentials
	socket.auth = {
		projectToken: pipelines?.TOKEN,
		userToken: userToken !== undefined ? userToken : localStorage.getItem('token'),
	}

	// Trigger reconnection flow
	if (socket.connected) {
		socket.disconnect().connect()
	} else {
		socket.connect()
	}

	console.log('[REALTIME] Reconnecting with updated identity...')
}

// Log connection status for debugging
socket.on('connect', () => console.log('[REALTIME] Connected with ID:', socket.id))
socket.on('disconnect', () => console.log('[REALTIME] Disconnected'))
socket.on('connect_error', (err) => console.error('[REALTIME] Connection Error:', err.message))
