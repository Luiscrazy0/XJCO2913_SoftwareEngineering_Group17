import axiosClient from '../utils/axiosClient'
import { ApiResponse, Booking, EndRideResponse } from '../types'

export const rideApi = {
  startRide: async (bookingId: string): Promise<Booking> => {
    const response = await axiosClient.post<ApiResponse<Booking>>(
      `/bookings/${bookingId}/start-ride`,
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to start ride')
    }
    return response.data.data!
  },

  endRide: async (
    bookingId: string,
    data: { returnStationId: string; isScooterIntact: boolean },
  ): Promise<EndRideResponse> => {
    const response = await axiosClient.post<ApiResponse<EndRideResponse>>(
      `/bookings/${bookingId}/end-ride`,
      data,
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to end ride')
    }
    return response.data.data!
  },
}
