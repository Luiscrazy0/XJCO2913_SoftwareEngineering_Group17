import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { useAuth } from '../context/AuthContext'

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

export default function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <PageLayout title="管理后台" subtitle={`欢迎回来，${user?.email}`} showFooter={false}>
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
