import axiosClient from '../utils/axiosClient'
import { ApiResponse, Booking, HireType, Scooter } from '../types'

export const employeeBookingsApi = {
  getAvailableScooters: async (): Promise<Scooter[]> => {
    const response = await axiosClient.get<ApiResponse<Scooter[]>>('/scooters', {
      params: { status: 'AVAILABLE' },
    })
    if (!response.data.success) {
      throw new Error(response.data.message || '获取可用车辆失败')
    }
    return response.data.data ?? []
  },

  create: async (payload: {
    guestEmail: string
    guestName: string
    scooterId: string
    hireType: HireType
    startTime: string
  }): Promise<Booking> => {
    const response = await axiosClient.post<ApiResponse<Booking>>(
      '/employee-bookings',
      payload,
    )
    if (!response.data.success) {
      throw new Error(response.data.message || '创建代客预约失败')
    }
    return response.data.data!
  },

  getAll: async (): Promise<Booking[]> => {
    const response = await axiosClient.get<ApiResponse<Booking[]>>(
      '/employee-bookings',
    )
    if (!response.data.success) {
      throw new Error(response.data.message || '获取代客预约列表失败')
    }
    return response.data.data ?? []
  },
}
