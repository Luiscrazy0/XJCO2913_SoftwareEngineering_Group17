import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

export default function NotFoundPage() {
  return (
    <PageLayout title="404" subtitle="页面未找到" showFooter={true}>
      <div className="text-center py-16">
        <div className="text-8xl font-bold text-[var(--mclaren-orange)]/30 mb-4">404</div>
        <p className="text-[var(--text-secondary)] mb-8">您访问的页面不存在或已被移除</p>
        <div className="flex justify-center gap-4">
          <Link to="/" className="px-6 py-3 bg-[var(--mclaren-orange)] text-white rounded-lg font-medium hover:brightness-110 transition-colors">
            返回首页
          </Link>
          <Link to="/scooters" className="px-6 py-3 border border-[var(--border-line)] text-[var(--text-main)] rounded-lg font-medium hover:bg-white/5 transition-colors">
            发现车辆
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
