import { create } from 'zustand'
import { authApi, reconnect } from './'

interface AuthenticationState {
	isLogged: boolean;
	loggedUser?: Record<string, unknown>;
	signup: (email: string, password: string, name: string) => Promise<void>;
	signin: (email: string, password: string) => Promise<void>;
	signout: () => void;
}

/**
 * Global state store for identity management.
 */
export const useAuthentication = create<AuthenticationState>((set) => ({
	isLogged: !!window.localStorage.getItem('token'),
	loggedUser: undefined,
	signup: async (email, password, name) => {
		const response = await authApi.post('/auth/signup', { email, password, name })
		if (!response.data.success) {
			throw new Error(response.data.message || 'Registration failed')
		}
	},
	signin: async (email, password) => {
		const response = await authApi.post('/auth/signin', { email, password })
		if (response.data.success) {
			const { token, user } = response.data
			window.localStorage.setItem('token', token)
			set({ isLogged: true, loggedUser: user })
			reconnect(token)
		} else {
			throw new Error(response.data.message || 'Login failed') 
		}
	},
	signout: () => {
		window.localStorage.removeItem('token')
		set({ isLogged: false, loggedUser: undefined })
		reconnect(null)
	},
}))
