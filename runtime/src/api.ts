import axios from 'axios'

export const api = axios.create({
  // Utilizamos la variable de entorno, si no existe toma el localhost por defecto
  baseURL: 'http://localhost:8000',
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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
