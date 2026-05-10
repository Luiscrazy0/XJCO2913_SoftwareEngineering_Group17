import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tabs = [
  {
    name: '发现车辆',
    href: '/scooters',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    show: (authenticated: boolean) => authenticated,
  },
  {
    name: '站点地图',
    href: '/map',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    show: (authenticated: boolean) => authenticated,
  },
  {
    name: '我的预约',
    href: '/bookings',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    show: (authenticated: boolean) => authenticated,
  },
  {
    name: '我的反馈',
    href: '/my-feedbacks',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    show: (authenticated: boolean) => authenticated,
  },
  {
    name: '管理后台',
    href: '/admin',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    show: (_authenticated: boolean, role?: string) => role === 'MANAGER',
  },
]

export default function MobileBottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const isAuthenticated = !!user

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999]
        bg-[var(--bg-card)]/90 backdrop-blur-xl
        border-t border-[var(--border-line)]
        bottom-nav-safe
        md:hidden"
      role="navigation"
      aria-label="底部导航"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs
          .filter((tab) => tab.show(isAuthenticated, user?.role))
          .map((tab) => {
            const isActive = location.pathname === tab.href
              || (tab.href !== '/' && location.pathname.startsWith(tab.href))
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--mclaren-orange)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.icon(isActive)}
                <span className="text-[10px] mt-0.5 font-medium">{tab.name}</span>
              </Link>
            )
          })}
      </div>
    </nav>
  )
}
