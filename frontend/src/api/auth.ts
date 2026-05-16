//API 模块 
// 封装了与后端认证相关的 API 调用，提供登录、注册等功能的接口，
import axiosClient from '../utils/axiosClient'
import { ApiResponse, LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<{ access_token: string }> => {
    const response = await axiosClient.post<ApiResponse<{ access_token: string }>>('/auth/login', credentials)
    if (!response.data || !response.data.data) {
      throw new Error('Login API returned malformed response')
    }
    return response.data.data
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<{ id: string, email: string }> => {
    const response = await axiosClient.post<ApiResponse<{ id: string; email: string }>>('/auth/register', userData)
    if (!response.data || !response.data.data) {
      throw new Error('Register API returned malformed response')
    }
    return response.data.data
  },

  // getProfile and logout endpoints pending backend implementation
}