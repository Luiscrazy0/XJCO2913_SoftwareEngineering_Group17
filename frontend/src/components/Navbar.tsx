import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigation = [
    { name: '发现车辆', href: '/scooters' },
    { name: '站点地图', href: '/map' },
    { name: '我的预约', href: '/bookings' },
    { name: '我的反馈', href: '/my-feedbacks' },
    { name: '管理后台', href: '/admin', role: 'MANAGER' as const },
    { name: '收入统计', href: '/statistics', role: 'MANAGER' as const },
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
    <>
      {/* 跳过导航链接 - 无障碍设计 */}
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only">
        跳转到主要内容
      </a>
      
      <nav className="bg-[var(--bg-card)] shadow-sm border-b border-[var(--border-line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center" aria-label="电动车租赁 - 返回首页">
                <svg className="w-8 h-8 text-[var(--mclaren-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-[var(--text-main)]">电动车租赁</span>
              </Link>
            </div>

            {/* Mobile toggle - 优化触屏体验 */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-3 rounded-md text-[var(--text-secondary)] hover:bg-white/5 touch-target"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "关闭导航菜单" : "打开导航菜单"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
                <span className="sr-only">{mobileOpen ? "关闭菜单" : "打开菜单"}</span>
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

        {/* Mobile drawer - 优化触屏体验 */}
        {mobileOpen && (
          <div 
            id="mobile-navigation"
            className="lg:hidden border-t border-[var(--border-line)] bg-[var(--bg-card)] px-4 pb-6 space-y-4"
            role="dialog"
            aria-label="移动导航菜单"
          >
            <div className="flex flex-col space-y-3 pt-4">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 touch-target ${
                    isActive(item.href)
                      ? 'text-[var(--mclaren-orange)] bg-white/10 border-l-4 border-[var(--mclaren-orange)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5 active:bg-white/10'
                  }`}
                  onClick={() => setMobileOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setMobileOpen(false)
                    }
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--border-line)]">
              {user ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center touch-target">
                      <span className="text-[var(--mclaren-orange)] font-medium text-base" aria-label="用户头像">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-base font-medium text-[var(--text-main)] flex items-center gap-2">
                        <span className="truncate" title={user.email}>{user.email}</span>
                        {user.role === 'MANAGER' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full border border-[var(--border-line)] bg-white/10 text-[var(--mclaren-orange)]" aria-label="管理员">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] mt-1">
                        {user.role === 'MANAGER' ? '管理员' : '用户'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      logout()
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors duration-200 touch-target"
                    aria-label="退出登录"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-[var(--mclaren-orange)] hover:bg-[var(--mclaren-orange-hover)] active:bg-[var(--mclaren-orange-depth)] rounded-lg transition-colors duration-200 touch-target"
                  onClick={() => setMobileOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setMobileOpen(false)
                    }
                  }}
                >
                  登录/注册
                </Link>
              )}
            </div>
            
            {/* 关闭按钮 - 移动端易访问 */}
            <div className="pt-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full px-4 py-3 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-line)] rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors duration-200 touch-target"
                aria-label="关闭菜单"
              >
                关闭菜单
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar