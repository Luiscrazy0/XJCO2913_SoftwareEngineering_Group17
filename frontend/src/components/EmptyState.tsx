import React from 'react'

interface EmptyStateProps {
  title?: string
  message?: string
  actionText?: string
  onAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无预约',
  message = '您还没有任何预约记录，快去发现可用的电动车吧！',
  actionText = '浏览车辆',
  onAction
}) => {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 mb-6">
        <svg className="w-full h-full text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-[var(--text-main)] mb-3">{title}</h3>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-6 py-3 bg-[var(--mclaren-orange)] text-white font-medium rounded-lg hover:brightness-110 focus:ring-2 focus:ring-[var(--mclaren-orange)]/40 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState
