import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { feedbackApi, Feedback, FeedbackFilters, FeedbackStatus, FeedbackPriority, FeedbackCategory } from '../api/feedback'
import Navbar from '../components/Navbar'
import { useToast } from '../components/ToastProvider'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { feedbackKeys } from '../utils/queryKeys'

export default function AdminFeedbacksPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [filters, setFilters] = useState<FeedbackFilters>({ status: 'PENDING' })
  const role = user?.role ?? null

  const {
    data: feedbacksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: feedbackKeys.list(role, filters),
    queryFn: () => feedbackApi.getAll(filters, 1, 100),
  })

  const feedbacks = feedbacksData?.items ?? []

  const { data: pendingCount = 0 } = useQuery({
    queryKey: feedbackKeys.pendingCount(role),
    queryFn: feedbackApi.getPendingCount,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => feedbackApi.update(id, data),
    onSuccess: () => {
      showToast('反馈更新成功', 'success')
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all })
    },
    onError: () => showToast('更新反馈失败', 'error'),
  })

  const handleFilterChange = (key: keyof FeedbackFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value as any }))
  }

  const handleQuickUpdate = (feedback: Feedback, field: 'priority' | 'status', value: string) => {
    updateMutation.mutate({ id: feedback.id, data: { [field]: value } })
  }

  const getPriorityColor = (priority: FeedbackPriority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-white'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-white'
      case 'RESOLVED': return 'bg-green-500 text-white'
      case 'ESCALATED': return 'bg-purple-500 text-white'
      case 'CHARGEABLE': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getCategoryColor = (category: FeedbackCategory) => {
    switch (category) {
      case 'DAMAGE': return 'bg-red-500 text-white'
      case 'FAULT': return 'bg-orange-500 text-white'
      case 'SUGGESTION': return 'bg-blue-500 text-white'
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
          <p className="mt-4 text-[var(--text-secondary)]">正在加载反馈数据…</p>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    const message = error instanceof Error ? error.message : '未知错误'
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/15 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-rose-200">加载失败</h2>
            <p className="mt-2 text-rose-200/80">{message}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasData = feedbacks.length > 0

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">管理员 · 反馈管理</p>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">反馈管理</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              查看、筛选和管理所有用户反馈报告。
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/high-priority"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              查看高优先级
            </Link>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 shadow-sm"
            >
              刷新
            </button>
          </div>
        </header>

        {/* Stats and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">待处理</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{pendingCount}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">!</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">等待审核</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">损坏报告</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">
                  {feedbacks.filter(f => f.category === 'DAMAGE').length}
                </h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 font-bold">⚠</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">需要关注</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">已解决</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">
                  {feedbacks.filter(f => f.status === 'RESOLVED').length}
                </h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 font-bold">✓</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">已完成案例</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">需要收费</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">
                  {feedbacks.filter(f => f.status === 'CHARGEABLE').length}
                </h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-500 font-bold">$</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">需要支付</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">过滤器</p>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">筛选反馈</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
              >
                <option value="">所有状态</option>
                <option value="PENDING">待处理</option>
                <option value="RESOLVED">已解决</option>
                <option value="ESCALATED">已升级</option>
                <option value="CHARGEABLE">需要收费</option>
              </select>

              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
              >
                <option value="">所有优先级</option>
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
                <option value="URGENT">紧急</option>
              </select>

              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
              >
                <option value="">所有分类</option>
                <option value="FAULT">故障</option>
                <option value="DAMAGE">损坏</option>
                <option value="SUGGESTION">建议</option>
              </select>

              <button
                onClick={() => setFilters({})}
                className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5"
              >
                清除筛选
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        {hasData ? (
          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between pb-3">
              <div>
<p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">反馈列表</p>
               <h2 className="text-xl font-semibold text-[var(--text-main)]">所有反馈报告</h2>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                显示 <span className="font-semibold text-[var(--text-main)]">{feedbacks.length}</span> 条反馈
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-line)]">
<th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">工单ID</th>
                     <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">标题</th>
                     <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">分类</th>
                     <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">优先级</th>
                     <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">状态</th>
                     <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">用户</th>
                     <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">提交时间</th>
                     <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--text-secondary)]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback.id} className="border-b border-[var(--border-line)] hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm text-[var(--text-main)]">
                          {feedback.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--text-main)]">{feedback.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] truncate max-w-xs">
                          {feedback.description}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                          {feedback.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={feedback.priority}
                          onChange={(e) => handleQuickUpdate(feedback, 'priority', e.target.value)}
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${getPriorityColor(feedback.priority)} border-none focus:ring-0`}
                        >
<option value="LOW">低</option>
                           <option value="MEDIUM">中</option>
                           <option value="HIGH">高</option>
                           <option value="URGENT">紧急</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={feedback.status}
                          onChange={(e) => handleQuickUpdate(feedback, 'status', e.target.value)}
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${getStatusColor(feedback.status)} border-none focus:ring-0`}
                        >
<option value="PENDING">待处理</option>
                           <option value="RESOLVED">已解决</option>
                           <option value="ESCALATED">已升级</option>
                           <option value="CHARGEABLE">需要收费</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-[var(--text-main)]">{feedback.createdByEmail}</div>
                        <div className="text-xs text-[var(--text-secondary)]">电动车位置: {feedback.scooterLocation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-[var(--text-main)]">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {new Date(feedback.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/feedbacks/${feedback.id}`}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            详情
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-line)] bg-[var(--bg-card)] p-10 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--text-main)]">未找到反馈</h3>
            <p className="mt-2 text-[var(--text-secondary)]">尝试调整您的筛选条件或稍后再查看。</p>
            <div className="mt-4">
              <button
                onClick={() => setFilters({})}
                className="rounded-lg bg-[var(--mclaren-orange)] px-5 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
              >
                清除筛选
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
