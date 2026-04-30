import axiosClient from '../utils/axiosClient'
import { ApiResponse, PriceEstimateResponse, HireType } from '../types'

export interface PricingConfig {
  HOUR_1: number
  HOUR_4: number
  DAY_1: number
  WEEK_1: number
}

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

  getPricing: async (): Promise<PricingConfig> => {
    const response = await axiosClient.get<PricingConfig>('/config/pricing')
    return response.data
  },

  updatePricing: async (hireType: string, price: number): Promise<PricingConfig> => {
    const response = await axiosClient.put<PricingConfig>(
      `/config/pricing/${hireType}`,
      { price },
    )
    return response.data
  },

  resetPricing: async (): Promise<PricingConfig> => {
    const response = await axiosClient.put<PricingConfig>('/config/pricing/reset')
    return response.data
  },
}
