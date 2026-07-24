import axios from 'axios'
import { useAuthStore } from '../state/auth'

import { navigate } from '../hooks/useRouter'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor para agregar los tokens en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const projectToken = localStorage.getItem('project-token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (projectToken) {
      config.headers['project-id'] = projectToken
      config.headers['x-project-id'] = projectToken
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
