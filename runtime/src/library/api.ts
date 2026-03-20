import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor for dynamic configuration and tokens
api.interceptors.request.use(
  (config) => {
    const pipelines = (window as any).PIPELINES;

    // Auth Token from window.PIPELINES.TOKEN or localStorage
    const token = pipelines?.TOKEN || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Inject Project ID Token (same as auth token in this setup)
      config.headers['x-project-id'] = token;
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
