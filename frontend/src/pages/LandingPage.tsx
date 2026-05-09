import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    title: '丰富车型',
    desc: '覆盖城市各大站点，随时随地方便取还。多款车型满足短途通勤和长距离出行需求。',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16v-2c0-1.105.895-2 2-2h12c1.105 0 2 .895 2 2v2M4 16c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2M4 16c-2.5 0-4-1.5-4-4s2-4 4-4m16 8c2.5 0 4-1.5 4-4s-2-4-4-4" />
      </svg>
    ),
    title: '灵活计费',
    desc: '支持按小时、按天、按周多种租赁方案。学生/长租用户更享专属折扣优惠。',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    title: '全城畅行',
    desc: '高德地图实时导航，智能推荐最近站点。一键预订，扫码即走，骑行无忧。',
  },
]

const pricingTiers = [
  { label: '1小时', hireType: 'HOUR_1', price: '¥25', desc: '短途通勤首选' },
  { label: '4小时', hireType: 'HOUR_4', price: '¥80', desc: '半天自由出行' },
  { label: '1天', hireType: 'DAY_1', price: '¥150', desc: '全天畅快骑行' },
  { label: '1周', hireType: 'WEEK_1', price: '¥600', desc: '长租更优惠' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const ctaLink = user ? (user.role === 'MANAGER' ? '/admin' : '/scooters') : '/auth'

  const handleBrowseClick = () => {
    if (!user) {
      sessionStorage.setItem('guest_mode', 'true')
    }
    navigate('/scooters')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-line)] safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="AAA电动车租赁 - 首页">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-[var(--mclaren-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-base md:text-xl font-bold text-[var(--text-main)]">AAA电动车租赁</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/scooters" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors" onClick={(e) => { if (!user) { e.preventDefault(); handleBrowseClick() } }}>
              浏览车辆
            </Link>
            {user ? (
              <Link to={user.role === 'MANAGER' ? '/admin' : '/scooters'} className="text-sm text-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange-hover)] transition-colors font-medium">
                进入系统
              </Link>
            ) : (
              <Link to="/auth" className="mclaren-btn-3d px-5 py-2 text-sm">
                登录/注册
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--mclaren-orange)]/15 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-[var(--mclaren-orange)]/8 blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-[var(--mclaren-orange)]/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 text-center relative">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--mclaren-orange)]/30 bg-[var(--mclaren-orange)]/5 text-sm text-[var(--mclaren-orange)] mb-8">
              <span className="w-2 h-2 rounded-full bg-[var(--mclaren-orange)] animate-pulse" />
              全新品牌升级
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-main)] tracking-tight">
              AAA电动车租赁
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              城市出行，即刻启程 — 覆盖全城的智能电动车租赁平台。
              <br className="hidden md:block" />
              随时随地，扫码即走。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={ctaLink}
                className="mclaren-btn-3d px-10 py-4 text-lg font-bold"
              >
                {user ? '进入系统' : '立即开始'}
              </Link>
              <Link
                to="/scooters"
                className="px-10 py-4 text-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-line)] hover:border-[var(--mclaren-orange)]/50 rounded-xl transition-all duration-200"
                onClick={(e) => { if (!user) { e.preventDefault(); handleBrowseClick() } }}
              >
                浏览车辆
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up">
            {[
              { value: '50+', label: '服务站点' },
              { value: '200+', label: '运营车辆' },
              { value: '24/7', label: '全天候服务' },
              { value: '10K+', label: '服务用户' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[var(--mclaren-orange)]">{stat.value}</div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[var(--bg-card)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)]">为什么选择我们</h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">简单三步，即刻开启您的城市骑行之旅</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="surface-card p-8 rounded-2xl text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--mclaren-orange)]/10 flex items-center justify-center text-[var(--mclaren-orange)]">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-main)] mb-3">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)]">三步轻松出行</h2>
            <p className="mt-4 text-[var(--text-secondary)]">从注册到骑行，只需三分钟</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '选择车辆', desc: '在地图上浏览附近可用车辆，选择适合您的车型和租赁时长。' },
              { step: '02', title: '确认支付', desc: '确认订单信息，选择支付方式完成支付，立即获取车辆使用权。' },
              { step: '03', title: '开始骑行', desc: '扫码解锁车辆，即刻出发。骑行结束后在站点归还即可。' },
            ].map((s) => (
              <div key={s.step} className="text-center p-6">
                <div className="text-5xl font-black text-[var(--mclaren-orange)]/20 mb-4">{s.step}</div>
                <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-[var(--bg-card)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)]">透明定价</h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">灵活的租赁方案，满足您的不同出行需求</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.hireType}
                className="surface-card p-6 rounded-2xl text-center hover:border-[var(--mclaren-orange)]/50 transition-all duration-200"
              >
                <div className="text-sm font-medium text-[var(--text-secondary)] mb-2">{tier.label}</div>
                <div className="text-3xl font-bold text-[var(--mclaren-orange)] mb-2">{tier.price}</div>
                <div className="text-xs text-[var(--text-secondary)]">{tier.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-10 md:p-16 rounded-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
              准备好了吗？
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              加入 AAA电动车租赁，即刻体验智能、便捷的城市出行方式。
            </p>
            <Link
              to={ctaLink}
              className="mclaren-btn-3d px-12 py-4 text-lg font-bold inline-block"
            >
              {user ? '进入系统' : '免费注册'}
            </Link>
            {!user && (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                已有账号？{' '}
                <Link to="/auth" className="text-[var(--mclaren-orange)] hover:underline font-medium">
                  立即登录
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
