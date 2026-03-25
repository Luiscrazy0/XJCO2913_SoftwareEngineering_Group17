import axiosClient from '../utils/axiosClient'
import { Scooter } from '../types'

export const scootersApi = {
  // Get all scooters
  getAll: async (): Promise<Scooter[]> => {
    const response = await axiosClient.get<Scooter[]>('/scooters')
    return response.data
  },

  // Get scooter by ID
  getById: async (id: string): Promise<Scooter> => {
    const response = await axiosClient.get<Scooter>(`/scooters/${id}`)
    return response.data
  },

  // Create new scooter (admin only) - 只需要location字段
  create: async (location: string): Promise<Scooter> => {
    const response = await axiosClient.post<Scooter>('/scooters', { location })
    return response.data
  },

  // Update scooter status (admin only)
  updateStatus: async (id: string, status: 'AVAILABLE' | 'UNAVAILABLE'): Promise<Scooter> => {
    const response = await axiosClient.patch<Scooter>(`/scooters/${id}/status`, { status })
    return response.data
  },

  // Delete scooter (admin only)
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/scooters/${id}`)
  },
}