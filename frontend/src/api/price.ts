import axiosClient from '../utils/axiosClient'
import { ApiResponse } from '../types'

export interface PricingItem {
  hireType: string
  price: number
}

export interface DiscountItem {
  userType: string
  rate: number
}

export const priceApi = {
  getPricing: async (): Promise<PricingItem[]> => {
    const response = await axiosClient.get<ApiResponse<PricingItem[]>>('/config/pricing')
    if (!response.data.success) throw new Error(response.data.message || '获取价格配置失败')
    return response.data.data ?? []
  },

  updatePricing: async (hireType: string, price: number): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/config/pricing/${hireType}`, { price })
    if (!response.data.success) throw new Error(response.data.message || '更新价格失败')
  },

  resetPricing: async (): Promise<void> => {
    const response = await axiosClient.post<ApiResponse<null>>('/config/pricing/reset')
    if (!response.data.success) throw new Error(response.data.message || '重置价格失败')
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
