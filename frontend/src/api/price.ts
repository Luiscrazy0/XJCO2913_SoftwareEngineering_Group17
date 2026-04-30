import axiosClient from '../utils/axiosClient'
import { ApiResponse, PriceEstimateResponse, HireType } from '../types'

export interface PricingConfig {
  HOUR_1: number
  HOUR_4: number
  DAY_1: number
  WEEK_1: number
}

export interface DiscountItem {
  userType: string
  rate: number
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
    const response = await axiosClient.get<ApiResponse<PricingConfig>>('/config/pricing')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to load pricing')
    }
    return response.data.data!
  },

  updatePricing: async (hireType: string, price: number): Promise<PricingConfig> => {
    const response = await axiosClient.put<ApiResponse<PricingConfig>>(
      `/config/pricing/${hireType}`,
      { price },
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update pricing')
    }
    return response.data.data!
  },

  resetPricing: async (): Promise<PricingConfig> => {
    const response = await axiosClient.put<ApiResponse<PricingConfig>>('/config/pricing/reset', {})
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reset pricing')
    }
    return response.data.data!
  },

  getDiscounts: async (): Promise<DiscountItem[]> => {
    const response = await axiosClient.get<ApiResponse<DiscountItem[]>>('/config/discounts')
    if (!response.data.success) throw new Error(response.data.message || '获取折扣率失败')
    return response.data.data ?? []
  },

  updateDiscount: async (userType: string, rate: number): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/config/discounts/${userType}`, { rate })
    if (!response.data.success) throw new Error(response.data.message || '更新折扣率失败')
  },
}
