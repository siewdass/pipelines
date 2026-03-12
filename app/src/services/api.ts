import axios from 'axios'
import { useAuthStore } from '../state/auth'
import { useNavigate } from "react-router";
import { useEffect } from "react";

export let navigate: (path: string) => void;

export const setNavigate = (nav: (path: string) => void) => {
  navigate = nav;
};

export const NavigateSetter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null;
};

export const api = axios.create({
  // Utilizamos la variable de entorno, si no existe toma el localhost por defecto
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar los tokens en cada petición
api.interceptors.request.use(
  (config) => {
    // Aquí tomamos los tokens. Más adelante podríamos tomarlos de un Contexto
    // o estado global si no queremos usar localStorage directamente.
    const token = localStorage.getItem('token')
    const projectToken = localStorage.getItem('project-token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (projectToken) {
      config.headers['project-id'] = projectToken
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta para manejar sesiones expiradas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiamos el estado global. 
      useAuthStore.getState().logout()
      
      // Redireccionamos usando el sistema de navegación de React Router
      if (navigate) navigate('/signin');
    }
    return Promise.reject(error)
  }
)
