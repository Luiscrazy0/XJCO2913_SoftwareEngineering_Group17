import axiosClient from '../utils/axiosClient'
import { ApiResponse } from '../types'

export interface PaymentCard {
  id: string
  last4: string
  expiryMonth: number
  expiryYear: number
  cardholderName: string
  brand: string
}

export interface SaveCardPayload {
  cardNumber: string
  expiryMonth: number
  expiryYear: number
  cardholderName: string
  brand: string
}

export const paymentCardApi = {
  getCards: async (): Promise<PaymentCard[]> => {
    const response = await axiosClient.get<ApiResponse<PaymentCard[]>>('/bookings/payment-card')
    if (!response.data.success) {
      throw new Error(response.data.message || '获取银行卡失败')
    }
    return response.data.data ?? []
  },

  saveCard: async (payload: SaveCardPayload): Promise<PaymentCard> => {
    const response = await axiosClient.post<ApiResponse<PaymentCard>>('/bookings/payment-card', payload)
    if (!response.data.success) {
      throw new Error(response.data.message || '保存银行卡失败')
    }
    return response.data.data!
  },

  deleteCard: async (): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<void>>('/bookings/payment-card')
    if (!response.data.success) {
      throw new Error(response.data.message || '删除银行卡失败')
    }
  },
}
