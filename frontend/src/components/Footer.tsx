import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border-line)] bg-[var(--bg-card)]/50 backdrop-blur-sm mt-auto hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[var(--mclaren-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-lg font-bold text-[var(--text-main)]">电动车租赁</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              便捷、环保的电动滑板车租赁服务。随时随地，轻松出行。
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider mb-3">快速链接</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/scooters" className="text-[var(--text-secondary)] hover:text-[var(--mclaren-orange)] transition-colors">发现车辆</Link></li>
              <li><Link to="/map" className="text-[var(--text-secondary)] hover:text-[var(--mclaren-orange)] transition-colors">站点地图</Link></li>
              <li><Link to="/bookings" className="text-[var(--text-secondary)] hover:text-[var(--mclaren-orange)] transition-colors">我的预约</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider mb-3">联系我们</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@escooter-rental.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                400-888-9999
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[var(--border-line)] text-center text-xs text-[var(--text-secondary)]">
          <p>&copy; {year} 电动车租赁系统. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
