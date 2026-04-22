/**
 * JWT 工具函数
 * 提供 JWT token 的解析和验证功能
 */
import type { UserRole } from '../types'

export interface JWTPayload {
  sub: string
  role: UserRole
  exp?: number
  iat?: number
}


/**
 * 解码 JWT token
 * @param token JWT token 字符串
 * @returns 解码后的 payload 对象，如果解码失败返回 null
 */
export function decodeJWT(token?: string | null): JWTPayload | null {
  if (!token) return null

  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) throw new Error('Invalid JWT format')

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * 检查 JWT token 是否过期
 * @param token JWT token 字符串
 * @returns 如果 token 已过期返回 true，否则返回 false
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}
