import axiosClient from '../utils/axiosClient'
import { Booking, ApiResponse, PaginatedResponse } from '../types'

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
  create: async (scooterId: string): Promise<Booking> => {
    const response = await axiosClient.post<ApiResponse<Booking>>('/bookings', { scooterId })
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