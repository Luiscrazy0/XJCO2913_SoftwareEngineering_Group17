import axiosClient from '../utils/axiosClient'
import { ApiResponse, PaginatedResponse } from '../types'

export interface AdminUser {
  id: string
  email: string
  role: string
  userType: string
  createdAt: string
}

export const usersApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<AdminUser>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<AdminUser>>>('/users', { params })
    if (!response.data.success) throw new Error(response.data.message || '获取用户列表失败')
    return response.data.data!
  },

  updateUserType: async (userId: string, userType: string): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/users/${userId}/user-type`, { userType })
    if (!response.data.success) throw new Error(response.data.message || '更新用户类型失败')
  },
}
