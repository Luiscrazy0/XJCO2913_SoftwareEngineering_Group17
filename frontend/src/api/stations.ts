import axiosClient from '../utils/axiosClient'
import { ApiResponse, Station, StationQueryParams, PaginatedResponse } from '../types'

export const stationsApi = {
  getAll: async (page?: number, limit?: number): Promise<PaginatedResponse<Station>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Station>>>('/stations', {
      params: { page, limit },
    })
    if (!response.data.data) throw new Error('Failed to fetch stations')
    return response.data.data
  },

  getAvailableStations: async (): Promise<Station[]> => {
    const response = await axiosClient.get<ApiResponse<Station[]>>('/stations/available')
    if (!response.data.data) throw new Error('Failed to fetch available stations')
    return response.data.data
  },

  getNearbyStations: async (params: StationQueryParams): Promise<Station[]> => {
    const response = await axiosClient.get<ApiResponse<Station[]>>('/stations/nearby', { params })
    if (!response.data.data) throw new Error('Failed to fetch nearby stations')
    return response.data.data
  },

  getById: async (id: string): Promise<Station> => {
    const response = await axiosClient.get<ApiResponse<Station>>(`/stations/${id}`)
    if (!response.data.data) throw new Error('Failed to fetch station')
    return response.data.data
  },
}
