import { create } from 'zustand';
import { api, reconnect } from './api';

interface AuthState {
	isLogged: boolean;
	loggedUser?: { [key: string]: any };
	signup: (email: string, password: string, name: string) => Promise<void>;
	signin: (email: string, password: string) => Promise<void>;
	signout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
	isLogged: !!window.localStorage.getItem('token'),
	loggedUser: undefined,
	signup: async (email, password, name) => {
		const response = await api.post("/authentication/signup", { email, password, name });
		if (!response.data.success) {
			throw new Error(response.data.message || "Registration failed");
		}
	},
	signin: async (email, password) => {
		const response = await api.post("/authentication/signin", { email, password });
		if (response.data.success) {
			const token = response.data.token;
			window.localStorage.setItem('token', token);
			set({ isLogged: true, loggedUser: { email } });
			
			// Reconnect socket with the new user identity
			reconnect(token);
		} else {
			throw new Error(response.data.message || "Login failed"); 
		}
	},
	signout: () => {
		window.localStorage.removeItem('token');
		set({ isLogged: false, loggedUser: undefined });
		
		// Reconnect socket to clear user identity (Anonymous mode)
		reconnect(null);
	},
}));
