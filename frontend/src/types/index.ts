// Core domain types aligned with backend DTOs

export type UserRole = 'CUSTOMER' | 'MANAGER'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Scooter {
  id: string
  name: string
  model: string
  batteryLevel: number
  location: {
    latitude: number
    longitude: number
    address: string
  }
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RESERVED'
  pricePerMinute: number
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  scooterId: string
  userId: string
  startTime: string
  endTime: string | null
  totalCost: number | null
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}