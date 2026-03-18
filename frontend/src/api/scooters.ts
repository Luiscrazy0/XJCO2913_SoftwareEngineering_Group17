import axiosClient from '../utils/axiosClient'
import { Scooter, ApiResponse, PaginatedResponse } from '../types'

export const scootersApi = {
  // Get all scooters with optional filters
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
    minBattery?: number
  }): Promise<PaginatedResponse<Scooter>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Scooter>>>('/scooters', { params })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch scooters')
    }
    return response.data.data!
  },

  // Get scooter by ID
  getById: async (id: string): Promise<Scooter> => {
    const response = await axiosClient.get<ApiResponse<Scooter>>(`/scooters/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch scooter')
    }
    return response.data.data!
  },

  // Create new scooter (admin only)
  create: async (scooterData: Omit<Scooter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Scooter> => {
    const response = await axiosClient.post<ApiResponse<Scooter>>('/scooters', scooterData)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create scooter')
    }
    return response.data.data!
  },

  // Update scooter (admin only)
  update: async (id: string, scooterData: Partial<Scooter>): Promise<Scooter> => {
    const response = await axiosClient.put<ApiResponse<Scooter>>(`/scooters/${id}`, scooterData)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update scooter')
    }
    return response.data.data!
  },

  // Delete scooter (admin only)
  delete: async (id: string): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<void>>(`/scooters/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete scooter')
    }
  },
}