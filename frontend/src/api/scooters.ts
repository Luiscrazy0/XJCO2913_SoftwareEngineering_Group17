import axiosClient from '../utils/axiosClient'
import { ApiResponse, Scooter, PaginatedResponse } from '../types'

export const scootersApi = {
  getAll: async (page?: number, limit?: number): Promise<PaginatedResponse<Scooter>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Scooter>>>('/scooters', {
      params: { page, limit },
    })
    return response.data.data ?? { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }
  },

  getById: async (id: string): Promise<Scooter> => {
    const response = await axiosClient.get<ApiResponse<Scooter>>(`/scooters/${id}`)
    if (!response.data.data) throw new Error('Failed to load scooter')
    return response.data.data
  },

  create: async (location: string): Promise<Scooter> => {
    const response = await axiosClient.post<ApiResponse<Scooter>>('/scooters', { location })
    if (!response.data.data) throw new Error('Failed to create scooter')
    return response.data.data
  },

  updateStatus: async (id: string, status: Scooter['status']): Promise<Scooter> => {
    const response = await axiosClient.patch<ApiResponse<Scooter>>(`/scooters/${id}/status`, { status })
    if (!response.data.data) throw new Error('Failed to update scooter status')
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<null>>(`/scooters/${id}`)
  },

  forceReset: async (id: string): Promise<Scooter> => {
    const response = await axiosClient.post<ApiResponse<Scooter>>(`/scooters/${id}/force-reset`)
    if (!response.data.data) throw new Error('Failed to force-reset scooter')
    return response.data.data
  },
}
