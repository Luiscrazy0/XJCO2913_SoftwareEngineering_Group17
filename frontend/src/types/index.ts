// Core domain types aligned with backend DTOs

export type UserRole = 'CUSTOMER' | 'MANAGER'

export type HireType = 'HOUR_1' | 'HOUR_4' | 'DAY_1' | 'WEEK_1'

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface Scooter {
  id: string
  location: string  // 位置描述字符串，如"Main Street, Building 5"
  status: 'AVAILABLE' | 'UNAVAILABLE'  // 与后端ScooterStatus枚举对齐
}

export interface Booking {
  id: string
  userId: string
  scooterId: string
  hireType: HireType
  startTime: string   // ISO日期字符串
  endTime: string     // ISO日期字符串
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalCost: number
  scooter: Scooter    // 关联的电动车信息
  user: User          // 关联的用户信息
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
