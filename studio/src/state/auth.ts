import { create } from 'zustand';
import { api } from '../services/api';
import { navigate } from '../hooks/useRouter';

export interface LoggedUser {
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  loggedUser?: LoggedUser;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!window.localStorage.getItem('token'), // isLogged
  loggedUser: undefined,
  register: async (email, password, name) => {
    const response = await api.post("/authentication/account/register", { email, password, name });
    if (!response.data.success) {
      throw new Error(response.data.message || "Registration failed");
    }
  },
  login: async (email, password) => {
    const response = await api.post("/authentication/account/login", { email, password });
    if (response.data.success) {
      window.localStorage.setItem('token', response.data.token);
      set({ isAuthenticated: true, loggedUser: { email, name: response.data.user?.name || '' } });
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  },
  logout: () => {
    window.localStorage.removeItem('token');
    navigate('/signin');
    set({ isAuthenticated: false, loggedUser: undefined });
  },
}));
