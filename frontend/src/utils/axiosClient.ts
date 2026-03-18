import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// Base URL configuration
// For now, use hardcoded URL. Will be replaced with environment variable in production
const BASE_URL = 'http://localhost:3000/api'

// Create axios instance
const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for injecting token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (simplified - will be replaced with AuthContext)
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    
    // You can add more error handling here (e.g., 403, 500, etc.)
    
    return Promise.reject(error)
  }
)

export default axiosClient