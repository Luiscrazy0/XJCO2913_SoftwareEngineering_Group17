import axiosClient from '../utils/axiosClient'
import { Booking, ApiResponse, HireType, ExtendBookingRequest, PaginatedResponse } from '../types'

export const bookingsApi = {
  getMyBookings: async (page?: number, limit?: number): Promise<PaginatedResponse<Booking>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings', {
      params: { page, limit },
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings')
    }
    return response.data.data!
  },

  create: async (payload: {
    scooterId: string
    hireType: HireType
    startTime: string
  }): Promise<Booking> => {
    const response = await axiosClient.post<ApiResponse<Booking>>('/bookings', payload)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create booking')
    }
    return response.data.data!
  },

  extend: async (id: string, payload: ExtendBookingRequest): Promise<Booking> => {
    const response = await axiosClient.patch<ApiResponse<Booking>>(`/bookings/${id}/extend`, payload)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to extend booking')
    }
    return response.data.data!
  },

  cancel: async (id: string): Promise<Booking> => {
    const response = await axiosClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel booking')
    }
    return response.data.data!
  },

  complete: async (id: string, isScooterIntact: boolean): Promise<Booking> => {
    const response = await axiosClient.patch<ApiResponse<Booking>>(`/bookings/${id}/complete`, {
      isScooterIntact,
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete booking')
    }
    return response.data.data!
  },
}
