//Axios 实例封装，提供统一的 API 请求接口，
// 包含基础 URL 配置、请求拦截器（注入 token）和响应拦截器（统一错误处理）
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// Base URL configuration (prefer env, fallback to localhost for stability)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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

      // 通知应用层做统一处理（Toast + 重定向）
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }
    
    // You can add more error handling here (e.g., 403, 500, etc.)
    
    return Promise.reject(error)
  }
)

export default axiosClient
export const API_BASE_URL = BASE_URL
