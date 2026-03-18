import axios from 'axios'

export const api = axios.create({
  baseURL: (window as any).PIPELINES?.API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor for dynamic configuration and tokens
api.interceptors.request.use(
  (config) => {
    // Dynamic baseURL from window if provided
    const pipelines = (window as any).PIPELINES;
    if (pipelines?.API_URL) {
      config.baseURL = pipelines.API_URL;
    }

    // Auth Token from window.PIPELINES.TOKEN or localStorage
    const token = pipelines?.TOKEN || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
