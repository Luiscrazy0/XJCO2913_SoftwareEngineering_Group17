import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { feedbackApi, FeedbackCategory } from '../api/feedback'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { feedbackKeys } from '../utils/queryKeys'

export default function HighPriorityPage() {
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | 'ALL'>('ALL')
  const { user } = useAuth()
  const role = user?.role ?? null

  // 检查用户是否有权限访问此页面
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/15 p-6 shadow-sm text-center">
            <h2 className="text-lg font-semibold text-yellow-200">需要登录</h2>
            <p className="mt-2 text-yellow-200/80">请先登录以访问此页面。</p>
            <div className="mt-4">
              <a
                href="/auth"
                className="px-4 py-2 rounded-lg bg-[var(--mclaren-orange)] text-white font-semibold hover:brightness-110 inline-block"
              >
                前往登录
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user.role !== 'MANAGER') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-red-500/40 bg-red-500/15 p-6 shadow-sm text-center">
            <h2 className="text-lg font-semibold text-red-200">权限不足</h2>
            <p className="mt-2 text-red-200/80">您需要管理员权限才能访问高优先级问题页面。</p>
            <div className="mt-4">
              <a
                href="/"
                className="px-4 py-2 rounded-lg bg-[var(--mclaren-orange)] text-white font-semibold hover:brightness-110 inline-block"
              >
                返回首页
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: feedbackKeys.highPriority(role),
    queryFn: feedbackApi.getHighPriority,
  })

  const filteredFeedbacks = filterCategory === 'ALL' 
    ? feedbacks 
    : feedbacks.filter(f => f.category === filterCategory)

  // Sort: DAMAGE first, then by priority (URGENT > HIGH > MEDIUM > LOW), then by date
  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    // DAMAGE category first
    if (a.category === 'DAMAGE' && b.category !== 'DAMAGE') return -1
    if (a.category !== 'DAMAGE' && b.category === 'DAMAGE') return 1
    
    // Then by priority
    const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-white'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DAMAGE': return 'bg-red-500 text-white'
      case 'FAULT': return 'bg-orange-500 text-white'
      case 'SUGGESTION': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-white'
      case 'RESOLVED': return 'bg-green-500 text-white'
      case 'ESCALATED': return 'bg-purple-500 text-white'
      case 'CHARGEABLE': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--mclaren-orange)] border-t-transparent" />
          <p className="mt-4 text-[var(--text-secondary)]">正在加载高优先级问题…</p>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    const message = error instanceof Error ? error.message : '未知错误'
    
    // 尝试提供更具体的错误信息
    let detailedMessage = message
    if (message.includes('400')) {
      detailedMessage = '请求参数错误或缺少必要信息。请确保：\n1. 您已登录\n2. 您具有管理员权限\n3. 后端服务正在运行'
    } else if (message.includes('401')) {
      detailedMessage = '身份验证失败。请重新登录。'
    } else if (message.includes('403')) {
      detailedMessage = '权限不足。您需要管理员角色才能访问此页面。'
    }
    
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/15 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-rose-200">加载失败</h2>
            <p className="mt-2 text-rose-200/80 whitespace-pre-line">{detailedMessage}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                重试
              </button>
              {!user && (
                <a
                  href="/auth"
                  className="px-4 py-2 rounded-lg bg-[var(--mclaren-orange)] text-white font-semibold hover:brightness-110"
                >
                  前往登录
                </a>
              )}
              {user && user.role !== 'MANAGER' && (
                <a
                  href="/"
                  className="px-4 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700"
                >
                  返回首页
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const damageCount = feedbacks.filter(f => f.category === 'DAMAGE').length
  const urgentCount = feedbacks.filter(f => f.priority === 'URGENT').length
  const pendingCount = feedbacks.filter(f => f.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">管理员 · 高优先级问题</p>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">高优先级问题仪表板</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              监控和管理需要立即关注的紧急反馈。
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/feedbacks"
              className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 shadow-sm"
            >
              所有反馈
            </Link>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 shadow-sm"
            >
              刷新
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">损坏报告</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{damageCount}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 font-bold">⚠</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">需要立即关注</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">紧急优先级</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{urgentCount}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 font-bold">!</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">最高优先级问题</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">待处理</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{pendingCount}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">⏱</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">等待解决</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Filters</p>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">Filter by Category</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${filterCategory === 'ALL' ? 'bg-[var(--mclaren-orange)] text-white' : 'border border-[var(--border-line)] text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5'}`}
              >
                全部 ({feedbacks.length})
              </button>
              <button
                onClick={() => setFilterCategory('DAMAGE')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${filterCategory === 'DAMAGE' ? 'bg-red-600 text-white' : 'border border-[var(--border-line)] text-[var(--text-main)] hover:border-red-500 hover:bg-red-500/5'}`}
              >
                损坏 ({damageCount})
              </button>
              <button
                onClick={() => setFilterCategory('FAULT')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${filterCategory === 'FAULT' ? 'bg-orange-600 text-white' : 'border border-[var(--border-line)] text-[var(--text-main)] hover:border-orange-500 hover:bg-orange-500/5'}`}
              >
                故障 ({feedbacks.filter(f => f.category === 'FAULT').length})
              </button>
              <button
                onClick={() => setFilterCategory('SUGGESTION')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${filterCategory === 'SUGGESTION' ? 'bg-blue-600 text-white' : 'border border-[var(--border-line)] text-[var(--text-main)] hover:border-blue-500 hover:bg-blue-500/5'}`}
              >
                建议 ({feedbacks.filter(f => f.category === 'SUGGESTION').length})
              </button>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {sortedFeedbacks.length > 0 ? (
          <div className="space-y-4">
            {sortedFeedbacks.map((feedback) => (
              <div 
                key={feedback.id} 
                className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Left: Issue Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(feedback.category)}`}>
                        {feedback.category}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                      {feedback.damageType && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${feedback.damageType === 'INTENTIONAL' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                          {feedback.damageType}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-[var(--text-main)] mb-2">{feedback.title}</h3>
                    <p className="text-[var(--text-secondary)] mb-4 whitespace-pre-wrap">{feedback.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Submitted By</p>
                        <p className="text-[var(--text-main)] font-medium">{feedback.createdByEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Scooter</p>
                        <p className="text-[var(--text-main)] font-medium">ID: {feedback.scooterId}</p>
                        <p className="text-[var(--text-secondary)]">Location: {feedback.scooterLocation}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Submitted</p>
                        <p className="text-[var(--text-main)] font-medium">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          {new Date(feedback.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {feedback.managerNotes && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-300 mb-1">Manager Notes</p>
                        <p className="text-sm text-blue-200">{feedback.managerNotes}</p>
                      </div>
                    )}

                    {feedback.resolutionCost && feedback.resolutionCost > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-xs uppercase tracking-[0.2em] text-red-300 mb-1">Resolution Cost</p>
                        <p className="text-lg font-bold text-red-200">${feedback.resolutionCost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-48 flex flex-col gap-3">
                    <Link
                      to={`/admin/feedbacks/${feedback.id}`}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white text-center hover:bg-blue-700"
                    >
                      查看详情
                    </Link>
                    
                    {feedback.imageUrl && (
                      <div className="mt-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">图片</p>
                        <img 
                          src={feedback.imageUrl} 
                          alt="Feedback" 
                          className="rounded-lg w-full h-32 object-cover border border-[var(--border-line)]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-line)] bg-[var(--bg-card)] p-10 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--text-main)]">无高优先级问题</h3>
            <p className="mt-2 text-[var(--text-secondary)]">
              {filterCategory === 'ALL' 
                ? '所有高优先级问题已解决。做得好！'
                : `在高优先级中未找到${filterCategory === 'DAMAGE' ? '损坏' : filterCategory === 'FAULT' ? '故障' : '建议'}问题。`}
            </p>
            <div className="mt-4">
              <button
                onClick={() => setFilterCategory('ALL')}
                className="rounded-lg bg-[var(--mclaren-orange)] px-5 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
              >
                查看所有问题
              </button>
            </div>
          </div>
        )}

        {/* Export Section */}
        {sortedFeedbacks.length > 0 && (
          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">导出</p>
                <h2 className="text-xl font-semibold text-[var(--text-main)]">导出数据</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  导出当前筛选的列表用于报告目的。
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Simple CSV export implementation
                    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'User Email', 'Scooter ID', 'Submitted At', 'Resolution Cost']
                    const csvData = sortedFeedbacks.map(f => [
                      f.id,
                      f.title,
                      f.category,
                      f.priority,
                      f.status,
                      f.createdByEmail,
                      f.scooterId,
                      new Date(f.createdAt).toISOString(),
                      f.resolutionCost || '0'
                    ])
                    
                    const csvContent = [
                      headers.join(','),
                      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
                    ].join('\n')
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `high-priority-issues-${new Date().toISOString().split('T')[0]}.csv`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
                >
                  导出CSV
                </button>
                <button
                  onClick={() => {
                    // Simple PDF export simulation
                    alert('PDF export functionality would be implemented with a proper PDF generation library.')
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
                >
                  导出PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
