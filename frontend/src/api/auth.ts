import axiosClient from '../utils/axiosClient'
import { AuthResponse, LoginRequest, RegisterRequest, ApiResponse } from '../types'

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed')
    }
    return response.data.data!
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed')
    }
    return response.data.data!
  },

  // Get current user profile
  getProfile: async (): Promise<AuthResponse> => {
    const response = await axiosClient.get<ApiResponse<AuthResponse>>('/auth/profile')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get profile')
    }
    return response.data.data!
  },

  // Logout user
  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout')
  },
}