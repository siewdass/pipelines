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
		config.headers['x-project-id'] = token;
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
	autoConnect: true,
	reconnection: true,
	reconnectionDelay: 1000,
	reconnectionAttempts: 10,
	transports: [ 'polling' ], // Forzamos polling para estabilidad total en local
});

/**
 * Reconnects the socket with updated credentials.
 */
export const reconnect = (userToken?: string | null) => {
	const pipelines = (window as any).PIPELINES;
	socket.auth = {
		projectToken: pipelines,
		userToken: userToken !== undefined ? userToken : localStorage.getItem('token'),
	};
	if (socket.connected) {
		socket.disconnect().connect();
	} else {
		socket.connect();
	}
	console.log('[REALTIME] Synchronizing network identity...');
};

/**
 * 3. Cache & Providers
 */
export const queryClient = new QueryClient();

export const DataProvider = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Generic Logging
socket.on('connect', () => console.log('[REALTIME] Connection established:', socket.id));
socket.on('disconnect', () => console.log('[REALTIME] Connection lost'));

// 2. Data Management Submodules (Flatly exported)
export * from './inquiry';
export * from './mutation';
export * from './subscription';
export * from './publish';
export * from './authentication';
