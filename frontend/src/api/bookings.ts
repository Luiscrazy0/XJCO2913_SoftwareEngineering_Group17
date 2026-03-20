import axiosClient from '../utils/axiosClient'
import { Booking, ApiResponse, PaginatedResponse, HireType } from '../types'

export const bookingsApi = {
  // Get user's bookings
  getMyBookings: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<PaginatedResponse<Booking>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings/my', { params })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings')
    }
    return response.data.data!
  },

  // Create new booking
  create: async (payload: {
    userId: string
    scooterId: string
    hireType: HireType
    startTime: string
  }): Promise<Booking> => {
    // 计算结束时间
    const endTime = (() => {
      const start = new Date(payload.startTime)
      const end = new Date(start)
      
      switch (payload.hireType) {
        case 'HOUR_1':
          end.setHours(end.getHours() + 1)
          break
        case 'HOUR_4':
          end.setHours(end.getHours() + 4)
          break
        case 'DAY_1':
          end.setDate(end.getDate() + 1)
          break
        case 'WEEK_1':
          end.setDate(end.getDate() + 7)
          break
      }
      
      return end.toISOString()
    })()
    
    const response = await axiosClient.post<ApiResponse<Booking>>('/bookings', {
      ...payload,
      endTime
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create booking')
    }
    return response.data.data!
  },

  // Update booking (end booking)
  update: async (id: string): Promise<Booking> => {
    const response = await axiosClient.put<ApiResponse<Booking>>(`/bookings/${id}/end`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update booking')
    }
    return response.data.data!
  },

  // Cancel booking
  cancel: async (id: string): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<void>>(`/bookings/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel booking')
    }
  },
}
