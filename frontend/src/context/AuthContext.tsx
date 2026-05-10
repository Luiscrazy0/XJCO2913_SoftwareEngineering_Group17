import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '../types'
import { authApi } from '../api/auth'
import { useToast } from '../components/ToastProvider'
import { queryClient } from '../utils/queryClient'
import { bookingKeys, feedbackKeys } from '../utils/queryKeys'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, insuranceAcknowledged: boolean, emergencyContact?: string) => Promise<void>
  logout: (options?: LogoutOptions) => void
  isAuthenticated: boolean
}

interface LogoutOptions {
  redirect?: boolean
  reason?: 'manual' | 'expired' | 'external'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Helper function to decode JWT token
const decodeJWT = (token?: string | null): any => {
  if (!token) {
    console.error('Failed to decode JWT token: token is missing')
    return null
  }

  try {
    // JWT uses Base64Url encoding, not standard Base64
    const base64Url = token.split('.')[1]
    if (!base64Url) {
      throw new Error('Invalid JWT format')
    }

    // Replace Base64Url characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    // Decode
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT token:', error)
    return null
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        const payload = decodeJWT(storedToken)
        if (payload && payload.exp) {
          const now = Math.floor(Date.now() / 1000)
          if (payload.exp < now) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            setIsLoading(false)
            return
          }
        }
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // 1. 调用登录API
      const response = await authApi.login({ email, password })
      const accessToken = response.access_token
      if (!accessToken) {
        console.error('Login response missing token:', response)
        throw new Error('Failed to decode JWT token: token missing from response')
      }

      // 2. 解析JWT token获取用户信息
      const payload = decodeJWT(accessToken)
      if (!payload) {
        throw new Error('Failed to decode JWT token')
      }
      
      const user: User = {
        id: payload.sub,
        email: email,
        role: payload.role
      }
      
      // 3. 保存状态
      setToken(accessToken)
      setUser(user)
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))

      // 4. 路由跳转
      const redirectPath = localStorage.getItem('redirect_path')
      localStorage.removeItem('redirect_path')

      if (redirectPath) {
        navigate(redirectPath, { replace: true })
        return
      }

      if (user.role === 'MANAGER') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/scooters', { replace: true })
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, insuranceAcknowledged: boolean, emergencyContact?: string) => {
    try {
      // 1. 调用注册API
      await authApi.register({ email, password, insuranceAcknowledged, emergencyContact })
      
      // 2. 注册成功后自动登录
      await login(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = useCallback((options?: LogoutOptions) => {
    const redirect = options?.redirect !== false

    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')

    // Prevent cross-user cache leakage when accounts switch in the same browser session.
    queryClient.cancelQueries()
    queryClient.removeQueries({ queryKey: bookingKeys.all })
    queryClient.removeQueries({ queryKey: feedbackKeys.all })

    if (options?.reason === 'expired') {
      showToast('会话已过期，请重新登录。', 'error')
    } else if (options?.reason === 'external') {
      showToast('已在其他标签页登出，请重新登录。', 'info')
    } else {
      showToast('已成功登出', 'success')
    }

    if (redirect) {
      navigate('/', { replace: true })
    }
  }, [showToast, navigate])

  // 监听跨标签页登出 & session 过期事件
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'auth_token' && event.newValue === null) {
        logout({ reason: 'external' })
      }
    }

    const handleSessionExpired = () => {
      logout({ reason: 'expired' })
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('auth:session-expired', handleSessionExpired as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('auth:session-expired', handleSessionExpired as EventListener)
    }
  }, [logout])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
