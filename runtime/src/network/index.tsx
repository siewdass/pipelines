import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// --- Global Constants ---

const BASE_URL = 'http://localhost:8000';

/**
 * 1. Axios Instance
 * Configured with automatic header injection for Pipeline Identity.
 */
export const api = axios.create({
	baseURL: BASE_URL,
	headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
	const pipelines = (window as any).PIPELINES;
	const token = pipelines || localStorage.getItem('token');
	
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
		config.headers['project-id'] = token;
	}
	return config;
}, (error) => Promise.reject(error));

/**
 * 2. Socket.io Engine
 * Maintains a persistent full-duplex connection.
 */
const getInitialAuth = () => {
	const pipelines = (window as any).PIPELINES;
	return {
		projectToken: pipelines,
		userToken: localStorage.getItem('token'),
	};
};

export const socket: Socket = io(BASE_URL, {
	auth: getInitialAuth(),
	autoConnect: false, // Desactivado por defecto para evitar ruido al inicio
	reconnection: true,
	reconnectionDelay: 1000,
	reconnectionAttempts: 10,
	transports: [ 'polling' ],
	forceNew: true, // Siempre inicia una sesión fresca
	closeOnBeforeunload: true, // Avisa al servidor al cerrar/recargar
	multiplex: false, // No compartir conexión entre instancias
	rememberUpgrade: false, // Forzar handshake nuevo siempre
});

/**
 * Reconnects the socket with updated credentials.
 * acts as a LAZY activator!
 */
export const reconnect = (userToken?: string | null) => {
	const pipelines = (window as any).PIPELINES;
	socket.auth = {
		projectToken: pipelines,
		userToken: userToken !== undefined ? userToken : localStorage.getItem('token'),
	};
	if (!socket.connected) {
		console.log('[REALTIME] Connecting data stream...');
		socket.connect();
	} else {
		// Solo si ya estaba conectado, reiniciamos la sesión para aplicar nuevos tokens
		socket.disconnect().connect();
		console.log('[REALTIME] Synchronizing network identity...');
	}
};

/**
 * 3. Cache & Providers
 */
export const queryClient = new QueryClient();

// Generic Logging handlers
const setupSocketLogs = (socket: Socket) => {
	socket.on('connect', () => console.log('[REALTIME] Connection established:', socket.id));
	socket.on('disconnect', () => console.log('[REALTIME] Connection lost'));
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	React.useEffect(() => {
		setupSocketLogs(socket);
		
		// NOT MORE AUTO-CONNECT HERE!
		// Connection happens only when hooks are used via reconnect()

		return () => {
			socket.off('connect');
			socket.off('disconnect');
			socket.disconnect();
		};
	}, []);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// 2. Data Management Submodules (Flatly exported)
export * from './inquiry';
export * from './mutation';
export * from './subscription';
export * from './publish';
export * from './authentication';
export * from './can';
