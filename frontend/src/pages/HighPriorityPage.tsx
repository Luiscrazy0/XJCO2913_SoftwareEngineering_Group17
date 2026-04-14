import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { feedbackApi, Feedback, FeedbackCategory } from '../api/feedback'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

export default function HighPriorityPage() {
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | 'ALL'>('ALL')

  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['feedbacks', 'high-priority'],
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
          <p className="mt-4 text-[var(--text-secondary)]">Loading high priority issues…</p>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/15 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-rose-200">Failed to load</h2>
            <p className="mt-2 text-rose-200/80">{message}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Retry
              </button>
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
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Admin · High Priority Issues</p>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">High Priority Issues Dashboard</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Monitor and manage urgent feedback requiring immediate attention.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/feedbacks"
              className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 shadow-sm"
            >
              All Feedbacks
            </Link>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 shadow-sm"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Damage Reports</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{damageCount}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 font-bold">⚠</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Require immediate attention</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Urgent Priority</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{urgentCount}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 font-bold">!</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Highest priority issues</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Pending</p>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">{pendingCount}</h2>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">⏱</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Awaiting resolution</p>
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
                All ({feedbacks.length})
              </button>
              <button
                onClick={() => setFilterCategory('DAMAGE')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${filterCategory === 'DAMAGE' ? 'bg-red-600 text-white' : 'border border-[var(--border-line)] text-[var(--text-main)] hover:border-red-500 hover:bg-red-500/5'}`}
              >
                Damage ({damageCount})
              </button>
              <button
                onClick={() => setFilterCategory('FAULT')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${filterCategory === 'FAULT' ? 'bg-orange-600 text-white' : 'border border-[var(--border-line)] text-[var(--text-main)] hover:border-orange-500 hover:bg-orange-500/5'}`}
              >
                Fault ({feedbacks.filter(f => f.category === 'FAULT').length})
              </button>
              <button
                onClick={() => setFilterCategory('SUGGESTION')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${filterCategory === 'SUGGESTION' ? 'bg-blue-600 text-white' : 'border border-[var(--border-line)] text-[var(--text-main)] hover:border-blue-500 hover:bg-blue-500/5'}`}
              >
                Suggestion ({feedbacks.filter(f => f.category === 'SUGGESTION').length})
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
                      View Details
                    </Link>
                    
                    {feedback.imageUrl && (
                      <div className="mt-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">Image</p>
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
            <h3 className="mt-4 text-lg font-semibold text-[var(--text-main)]">No high priority issues</h3>
            <p className="mt-2 text-[var(--text-secondary)]">
              {filterCategory === 'ALL' 
                ? 'All high priority issues have been resolved. Great work!'
                : `No ${filterCategory.toLowerCase()} issues found in high priority.`}
            </p>
            <div className="mt-4">
              <button
                onClick={() => setFilterCategory('ALL')}
                className="rounded-lg bg-[var(--mclaren-orange)] px-5 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
              >
                View All Issues
              </button>
            </div>
          </div>
        )}

        {/* Export Section */}
        {sortedFeedbacks.length > 0 && (
          <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Export</p>
                <h2 className="text-xl font-semibold text-[var(--text-main)]">Export Data</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Export the current filtered list for reporting purposes.
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
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    // Simple PDF export simulation
                    alert('PDF export functionality would be implemented with a proper PDF generation library.')
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
