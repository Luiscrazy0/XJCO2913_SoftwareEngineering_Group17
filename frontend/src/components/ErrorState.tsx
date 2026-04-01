import React from 'react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = '加载失败',
  message = '无法加载预约数据，请检查网络连接后重试。',
  onRetry
}) => {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 mb-6">
        <svg className="w-full h-full text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-[var(--text-main)] mb-3">{title}</h3>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500/40 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重试
        </button>
      )}
    </div>
  )
}

export default ErrorState
