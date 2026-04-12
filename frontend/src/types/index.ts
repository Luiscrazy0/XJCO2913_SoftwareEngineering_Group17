// Core domain types aligned with backend DTOs

export type UserRole = 'CUSTOMER' | 'MANAGER'

export type HireType = 'HOUR_1' | 'HOUR_4' | 'DAY_1' | 'WEEK_1'

export type ScooterStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'RENTED'

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXTENDED'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'info'

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface Station {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  scooters: Scooter[]
  createdAt: string
  updatedAt: string
}

export interface Scooter {
  id: string
  location: string  // 位置描述字符串，如"Main Street, Building 5"
  status: ScooterStatus  // 与后端ScooterStatus枚举对齐
  latitude?: number
  longitude?: number
  stationId?: string
  station?: Station
  updatedAt: string
  amapAddress?: string  // 高德地图解析的真实地址
}

export interface Booking {
  id: string
  userId: string
  scooterId: string
  hireType: HireType
  originalEndTime?: string  // 原始结束时间（用于续租）
  startTime: string   // ISO日期字符串
  endTime: string     // ISO日期字符串
  status: BookingStatus
  totalCost: number
  extensionCount: number  // 续租次数
  extendedFrom?: string   // 原始预订ID（如果是续租）
  scooter: Scooter    // 关联的电动车信息
  user: User          // 关联的用户信息
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

// 扩展预订请求
export interface ExtendBookingRequest {
  additionalHours: number
}

// 站点查询参数
export interface StationQueryParams {
  latitude?: number
  longitude?: number
  radius?: number
}
