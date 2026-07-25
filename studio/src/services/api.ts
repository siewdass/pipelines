import axios from 'axios'
import { useAuthStore } from '../state/auth'

import { navigate } from '../hooks/useRouter'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
	baseURL: apiBaseUrl,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true,
})

api.interceptors.request.use(
	(config) => {
		const projectToken = localStorage.getItem('project-token')

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

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			useAuthStore.getState().logout()

			if (navigate) navigate('/signin')
		}
		return Promise.reject(error)
	}
)
