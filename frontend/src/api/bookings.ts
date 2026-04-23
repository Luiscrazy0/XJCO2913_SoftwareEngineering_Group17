//API 模块
// 封装了与后端预订相关的 API 调用，提供获取预订列表、创建预订和取消预订等功能的接口，
import axiosClient from '../utils/axiosClient'
import { Booking, ApiResponse, HireType, ExtendBookingRequest } from '../types'

export const bookingsApi = {
  // Get user's bookings - 使用正确的端点 GET /bookings
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosClient.get<ApiResponse<Booking[]>>('/bookings')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings')
    }
    return response.data.data!
  },

  // Create new booking
  create: async (payload: {
    scooterId: string
    hireType: HireType
    startTime: string
  }): Promise<Booking> => {
    const response = await axiosClient.post<ApiResponse<Booking>>('/bookings', {
      ...payload
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create booking')
    }
    return response.data.data!
  },

  // 续租预订
  extend: async (id: string, payload: ExtendBookingRequest): Promise<Booking> => {
    const response = await axiosClient.patch<ApiResponse<Booking>>(`/bookings/${id}/extend`, payload)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to extend booking')
    }
    return response.data.data!
  },

  // Cancel booking
  cancel: async (id: string): Promise<Booking> => {
    const response = await axiosClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel booking')
    }
    return response.data.data!
  },
}
