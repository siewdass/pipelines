import { create } from 'zustand';
import { api } from './api';

interface AuthState {
  isLogged: boolean;
  loggedUser?: {
    [key: string]: any;
  };
  signup: (email: string, password: string, name: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isLogged: !!window.localStorage.getItem('token'), // isLogged
  loggedUser: undefined,
  signup: async (email, password, name) => {
    const response = await api.post("/authentication/account/register", { email, password, name });
    if (!response.data.success) {
      throw new Error(response.data.message || "Registration failed");
    }
  },
  signin: async (email, password) => {
    const response = await api.post("/authentication/account/login", { email, password });
    if (response.data.success) {
      window.localStorage.setItem('token', response.data.token);
      set({ isLogged: true, loggedUser: { email } });
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  },
  signout: () => {
    window.localStorage.removeItem('token');
    set({ isLogged: false, loggedUser: undefined });
  },
}));
