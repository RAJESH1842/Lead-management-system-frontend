import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.com/api'
  : '/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong'
    const status = error.response?.status

    if (status === 401) {
      // ⚡ FIX: Prevent infinite redirect loop for /auth/me
      if (!error.config?.url?.includes('/auth/me')) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status >= 400) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
