import axiosClient from '../utils/axiosClient'
import { ApiResponse, PriceEstimateResponse, HireType } from '../types'

export const priceApi = {
  estimate: async (hireType: HireType): Promise<PriceEstimateResponse> => {
    const response = await axiosClient.get<ApiResponse<PriceEstimateResponse>>(
      '/bookings/estimate-price',
      { params: { hireType } },
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to estimate price')
    }
    return response.data.data!
  },
}
