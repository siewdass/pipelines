import axios from 'axios'
import { useAuthStore } from '../state/auth'

import { navigate } from '../hooks/useRouter'

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

    // Auto-detect projectId from URL to assist ProjectGuard when using Account Token
    const pathParts = window.location.pathname.split('/'); // e.g. ["", "projects", "details", "123"]
    const projectsIndex = pathParts.indexOf('projects');
    if (projectsIndex !== -1 && pathParts[projectsIndex + 2]) {
      const allowedPaths = ['details', 'projectdata', 'projecttables'];
      if (allowedPaths.includes(pathParts[projectsIndex + 1])) {
        config.headers['x-project-id'] = pathParts[projectsIndex + 2];
      }
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
