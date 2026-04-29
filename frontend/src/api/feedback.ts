// API module for feedback
import axiosClient from '../utils/axiosClient'
import { ApiResponse, PaginatedResponse } from '../types'

export type FeedbackCategory = 'FAULT' | 'DAMAGE' | 'SUGGESTION'
export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type FeedbackStatus = 'PENDING' | 'RESOLVED' | 'ESCALATED' | 'CHARGEABLE'
export type DamageType = 'NATURAL' | 'INTENTIONAL'

export interface Feedback {
  id: string
  title: string
  description: string
  category: FeedbackCategory
  priority: FeedbackPriority
  status: FeedbackStatus
  scooterId: string
  bookingId?: string
  imageUrl?: string
  managerNotes?: string
  resolutionCost?: number
  damageType?: DamageType
  createdById: string
  createdAt: string
  updatedAt: string
  createdByEmail: string
  scooterLocation: string
  bookingStartTime?: string
}

export interface CreateFeedbackRequest {
  title: string
  description: string
  category: FeedbackCategory
  scooterId: string
  bookingId?: string
  imageUrl?: string
}

export interface UpdateFeedbackRequest {
  priority?: FeedbackPriority
  status?: FeedbackStatus
  managerNotes?: string
  resolutionCost?: number
  damageType?: DamageType
}

export interface FeedbackFilters {
  status?: FeedbackStatus
  priority?: FeedbackPriority
  category?: FeedbackCategory
}

export const feedbackApi = {
  // Create new feedback
  create: async (payload: CreateFeedbackRequest): Promise<Feedback> => {
    const response = await axiosClient.post<ApiResponse<Feedback>>('/feedbacks', payload)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create feedback')
    }
    return response.data.data!
  },

  // Get my feedbacks
  getMyFeedbacks: async (page?: number, limit?: number): Promise<PaginatedResponse<Feedback>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Feedback>>>('/feedbacks/my', {
      params: { page, limit },
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch feedbacks')
    }
    return response.data.data!
  },

  // Get feedback by ID
  getById: async (id: string): Promise<Feedback> => {
    const response = await axiosClient.get<ApiResponse<Feedback>>(`/feedbacks/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch feedback')
    }
    return response.data.data!
  },

  // Update feedback (Manager only)
  update: async (id: string, payload: UpdateFeedbackRequest): Promise<Feedback> => {
    const response = await axiosClient.patch<ApiResponse<Feedback>>(`/feedbacks/${id}`, payload)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update feedback')
    }
    return response.data.data!
  },

  // Get all feedbacks (Manager only)
  getAll: async (filters?: FeedbackFilters, page?: number, limit?: number): Promise<PaginatedResponse<Feedback>> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.category) params.append('category', filters.category)
    if (page) params.append('page', String(page))
    if (limit) params.append('limit', String(limit))

    const url = `/feedbacks${params.toString() ? `?${params.toString()}` : ''}`
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Feedback>>>(url)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch feedbacks')
    }
    return response.data.data!
  },

  // Get high priority feedbacks (Manager only)
  getHighPriority: async (page?: number, limit?: number): Promise<PaginatedResponse<Feedback>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<Feedback>>>('/feedbacks/high-priority', {
      params: { page, limit },
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch high priority feedbacks')
    }
    return response.data.data!
  },

  // Get pending count (Manager only)
  getPendingCount: async (): Promise<number> => {
    const response = await axiosClient.get<ApiResponse<{ count: number }>>('/feedbacks/stats/pending-count')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch pending count')
    }
    return response.data.data!.count
  },
}