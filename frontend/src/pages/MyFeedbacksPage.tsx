import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { feedbackApi, Feedback } from '../api/feedback'
import Navbar from '../components/Navbar'

export default function MyFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const data = await feedbackApi.getMyFeedbacks()
      setFeedbacks(data)
      setError(null)
    } catch (err) {
console.error('获取反馈失败:', err)
    setError('加载您的反馈失败，请重试。')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return { className: 'bg-red-100 text-red-800', label: '紧急' }
      case 'HIGH': return { className: 'bg-orange-100 text-orange-800', label: '高' }
      case 'MEDIUM': return { className: 'bg-yellow-100 text-yellow-800', label: '中' }
      case 'LOW': return { className: 'bg-green-100 text-green-800', label: '低' }
      default: return { className: 'bg-gray-100 text-gray-800', label: priority }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { className: 'bg-yellow-100 text-yellow-800', label: '待处理' }
      case 'RESOLVED': return { className: 'bg-green-100 text-green-800', label: '已解决' }
      case 'ESCALATED': return { className: 'bg-purple-100 text-purple-800', label: '已升级' }
      case 'CHARGEABLE': return { className: 'bg-red-100 text-red-800', label: '可收费' }
      default: return { className: 'bg-gray-100 text-gray-800', label: status }
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'FAULT': return '故障'
      case 'DAMAGE': return '损坏'
      case 'SUGGESTION': return '建议'
      default: return category
    }
  }

if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--mclaren-orange)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--text-secondary)]">正在加载您的反馈...</p>
          </div>
        </div>
      </div>
    )
  }

return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回导航 */}
        <div className="mb-4">
          <a 
            href="/" 
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--mclaren-orange)] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </a>
        </div>
        
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">我的反馈</h1>
            <p className="text-[var(--text-secondary)] mt-2">
              查看和跟踪您提交的所有反馈。
            </p>
          </div>
        <Link
          to="/feedback/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          提交新反馈
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-lg">
          <p className="text-red-200">{error}</p>
          <button
            onClick={fetchFeedbacks}
            className="mt-2 px-3 py-1 bg-red-500/30 text-red-200 rounded-md hover:bg-red-500/40"
          >
            重试
          </button>
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--border-line)] shadow-[var(--shadow-card)]">
          <div className="text-[var(--text-secondary)] mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-main)] mb-2">暂无反馈</h3>
          <p className="text-[var(--text-secondary)] mb-6">您尚未提交任何反馈。</p>
          <Link
            to="/feedback/new"
className="px-4 py-2 bg-[var(--mclaren-orange)] text-white rounded-lg hover:brightness-110 font-medium transition-colors"
          >
            提交您的第一条反馈
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] shadow-[var(--shadow-card)] overflow-hidden rounded-xl border border-[var(--border-line)]">
          <ul className="divide-y divide-[var(--border-line)]">
            {feedbacks.map(feedback => (
              <li key={feedback.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-[var(--text-main)]">{feedback.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feedback.priority).className}`}>
                        {getPriorityColor(feedback.priority).label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status).className}`}>
                        {getStatusColor(feedback.status).label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{feedback.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getCategoryText(feedback.category)}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {feedback.scooterLocation}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Link
                      to={`/feedbacks/${feedback.id}`}
                      className="px-3 py-1 text-sm bg-white/10 text-[var(--text-secondary)] rounded-md hover:bg-white/20 hover:text-[var(--text-main)] transition-colors"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
                {feedback.managerNotes && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-300">管理员备注:</p>
                    <p className="text-sm text-blue-200 mt-1">{feedback.managerNotes}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
