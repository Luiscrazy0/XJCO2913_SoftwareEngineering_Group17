// Core domain types aligned with backend DTOs

export type UserRole = 'CUSTOMER' | 'MANAGER'

export type HireType = 'HOUR_1' | 'HOUR_4' | 'DAY_1' | 'WEEK_1'

export type ScooterStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'RENTED'

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'IN_PROGRESS' | 'CANCELLED' | 'COMPLETED' | 'EXTENDED'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'info'

export interface User {
  id: string
  email: string
  role: UserRole
  insuranceAcknowledged?: boolean
  emergencyContact?: string
}

export interface Station {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  isActive?: boolean
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
  pickupStationId?: string
  returnStationId?: string
  hireType: HireType
  originalEndTime?: string
  startTime: string
  endTime: string
  actualStartTime?: string
  actualEndTime?: string
  status: BookingStatus
  totalCost: number
  extensionCount: number
  extendedFrom?: string
  scooter: Scooter
  user: User
  pickupStation?: Station
  returnStation?: Station
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
  insuranceAcknowledged?: boolean
  emergencyContact?: string
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

// Price estimate
export interface PriceEstimateResponse {
  baseCost: number
  discountAmount: number
  discountRate: number
  discountedPrice: number
  discountReason: string
  hireType: HireType
  durationHours: number
}

// End ride response
export interface EndRideResponse {
  booking: Booking
  scooter: Scooter
  damageReportCreated: boolean
}

// Payment
export interface Payment {
  id: string
  bookingId: string
  amount: number
  status: string
  idempotencyKey?: string
  createdAt: string
  booking?: Booking
}

// Payment card
export interface PaymentCard {
  id: string
  lastFourDigits: string
  expiryDate: string
  cardHolder: string
  isDefault: boolean
  createdAt: string
}
