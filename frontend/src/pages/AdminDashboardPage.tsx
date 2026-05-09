import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageLayout from '../components/PageLayout'
import { useAuth } from '../context/AuthContext'
import { getDashboardSummary, DashboardSummary } from '../api/statistics'

interface DashboardCard {
  title: string
  description: string
  href: string
  icon: string
  iconBg: string
}

const cards: DashboardCard[] = [
  {
    title: '车队管理',
    description: '管理车辆与站点',
    href: '/admin/fleet',
    icon: '🛴',
    iconBg: 'bg-blue-500/10',
  },
  {
    title: '价格配置',
    description: '单价与折扣设置',
    href: '/admin/pricing',
    icon: '💰',
    iconBg: 'bg-green-500/10',
  },
  {
    title: '收入统计',
    description: '周报 / 日报 / 图表',
    href: '/statistics',
    icon: '📈',
    iconBg: 'bg-purple-500/10',
  },
  {
    title: '反馈管理',
    description: '查看与处理反馈',
    href: '/admin/feedbacks',
    icon: '📋',
    iconBg: 'bg-yellow-500/10',
  },
  {
    title: '高优先级',
    description: '紧急问题看板',
    href: '/admin/high-priority',
    icon: '⚠️',
    iconBg: 'bg-red-500/10',
  },
  {
    title: '用户管理',
    description: '用户类型与折扣',
    href: '/admin/users',
    icon: '👤',
    iconBg: 'bg-teal-500/10',
  },
  {
    title: '代客预约',
    description: '为游客创建预约',
    href: '/admin/staff-booking',
    icon: '🛎️',
    iconBg: 'bg-orange-500/10',
  },
]

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  iconBg: string
}

function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="surface-card p-5 rounded-xl">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
          <div className="text-2xl font-bold text-[var(--text-main)] tabular-nums">{value}</div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuth()

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    refetchInterval: 30000,
  })

  return (
    <PageLayout title="管理后台" subtitle={`欢迎回来，${user?.email}`} showFooter={false}>
      {/* Real-time stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="今日订单数"
          value={isLoading ? '...' : (summary?.todayOrders ?? 0)}
          icon="📦"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="今日收入"
          value={isLoading ? '...' : `¥${(summary?.todayRevenue ?? 0).toFixed(0)}`}
          icon="💵"
          iconBg="bg-green-500/10"
        />
        <StatCard
          label="已租出车辆"
          value={isLoading ? '...' : (summary?.rentedScooters ?? 0)}
          icon="🛴"
          iconBg="bg-[var(--mclaren-orange)]/10"
        />
        <StatCard
          label="总用户数"
          value={isLoading ? '...' : (summary?.totalUsers ?? 0)}
          icon="👥"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            to={card.href}
            className="block p-6 rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)]
              hover:border-[var(--mclaren-orange)]/50 hover:shadow-lg hover:shadow-[var(--mclaren-orange)]/5
              transition-all duration-200 group"
          >
            <div className={`w-12 h-12 rounded-lg ${card.iconBg} flex items-center justify-center text-2xl mb-4`}>
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-main)] group-hover:text-[var(--mclaren-orange)] transition-colors">
              {card.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
