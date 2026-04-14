import axiosClient from '../utils/axiosClient'
import { ApiResponse, Station, StationQueryParams } from '../types'

export const stationsApi = {
  // 获取所有站点
  getAll: async (): Promise<Station[]> => {
    const response = await axiosClient.get<ApiResponse<Station[]>>('/stations')
    if (!response.data.data) {
      throw new Error('Failed to fetch stations')
    }
    return response.data.data
  },

  // 获取有可用滑板车的站点
  getAvailableStations: async (): Promise<Station[]> => {
    const response = await axiosClient.get<ApiResponse<Station[]>>('/stations/available')
    if (!response.data.data) {
      throw new Error('Failed to fetch available stations')
    }
    return response.data.data
  },

  // 获取附近站点
  getNearbyStations: async (params: StationQueryParams): Promise<Station[]> => {
    const response = await axiosClient.get<ApiResponse<Station[]>>('/stations/nearby', { params })
    if (!response.data.data) {
      throw new Error('Failed to fetch nearby stations')
    }
    return response.data.data
  },

  // 获取单个站点
  getById: async (id: string): Promise<Station> => {
    const response = await axiosClient.get<ApiResponse<Station>>(`/stations/${id}`)
    if (!response.data.data) {
      throw new Error('Failed to fetch station')
    }
    return response.data.data
  },
}
