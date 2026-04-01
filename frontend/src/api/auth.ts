//API 模块 
// 封装了与后端认证相关的 API 调用，提供登录、注册等功能的接口，
import axiosClient from '../utils/axiosClient'
import { LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<{ access_token: string }> => {
    const response = await axiosClient.post('/auth/login', credentials)
    return response.data // 直接返回后端数据，没有ApiResponse包装
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<{ id: string, email: string }> => {
    const response = await axiosClient.post('/auth/register', userData)
    return response.data // 直接返回后端数据，没有ApiResponse包装
  },

  // Get current user profile - 暂时注释掉，后端可能没有这个接口
  // getProfile: async (): Promise<User> => {
  //   const response = await axiosClient.get('/auth/profile')
  //   return response.data
  // },

  // Logout user - 暂时注释掉，后端可能没有这个接口
  // logout: async (): Promise<void> => {
  //   await axiosClient.post('/auth/logout')
  // },
}