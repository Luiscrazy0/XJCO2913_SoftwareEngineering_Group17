import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigation = [
    { name: '发现车辆', href: '/scooters' },
    { name: '我的预约', href: '/bookings' },
    { name: '管理后台', href: '/admin', role: 'MANAGER' as const },
  ]

  const filteredNavigation = navigation.filter(item => {
    if (item.role) {
      return user?.role === item.role
    }
    return true
  })

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-[var(--bg-card)] shadow-sm border-b border-[var(--border-line)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg className="w-8 h-8 text-[var(--mclaren-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-[var(--text-main)]">电动车租赁</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--text-secondary)] hover:bg-white/5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 导航链接 - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-[var(--mclaren-orange)] bg-white/5'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* 用户信息 */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-[var(--mclaren-orange)] font-medium text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-[var(--text-main)] flex items-center gap-2">
                      {user.email}
                      {user.role === 'MANAGER' && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-[var(--border-line)] bg-white/10 text-[var(--mclaren-orange)]">ADMIN</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {user.role === 'MANAGER' ? '管理员' : '用户'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium text-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange-hover)] hover:bg-white/5 rounded-md transition-colors duration-200"
              >
                登录/注册
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border-line)] bg-[var(--bg-card)] px-4 pb-4 space-y-4">
          <div className="flex flex-col space-y-2 pt-3">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-[var(--mclaren-orange)] bg-white/5'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border-line)]">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-[var(--mclaren-orange)] font-medium text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-[var(--text-main)] flex items-center gap-2">
                      {user.email}
                      {user.role === 'MANAGER' && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-[var(--border-line)] bg-white/10 text-[var(--mclaren-orange)]">ADMIN</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">{user.role === 'MANAGER' ? '管理员' : '用户'}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logout()
                  }}
                  className="ml-4 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange-hover)] hover:bg-white/5 rounded-md transition-colors duration-200"
                onClick={() => setMobileOpen(false)}
              >
                登录/注册
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
