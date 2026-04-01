//鉴权门禁组件，确保只有经过身份验证的用户才能访问特定页面，
//并根据用户角色进行访问控制
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../types'
import { useToast } from './ToastProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()

  useEffect(() => {
    if (requiredRole && isAuthenticated && user?.role !== requiredRole) {
      showToast('无权限访问该页面', 'error')
    }
  }, [requiredRole, isAuthenticated, user?.role, showToast])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-main)]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--mclaren-orange)] border-t-transparent animate-spin" aria-label="loading" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    localStorage.setItem('redirect_path', location.pathname + location.search)
    return <Navigate to="/" replace />
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/403" replace />
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>
}
