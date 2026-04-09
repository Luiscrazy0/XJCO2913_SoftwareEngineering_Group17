// API 模块入口文件
// 导出所有API模块

export { authApi, authApiLegacy } from './auth'
export { bookingsApi, bookingsApiLegacy } from './bookings'
export { scootersApi, scootersApiLegacy } from './scooters'

// 类型导出
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from '../types'