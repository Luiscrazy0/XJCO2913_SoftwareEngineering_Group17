import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode
  /** 错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** 自定义错误渲染 */
  fallback?: ReactNode
  /** 错误消息 */
  errorMessage?: string
  /** 是否显示重试按钮 */
  showRetry?: boolean
  /** 重试回调 */
  onRetry?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * 错误边界组件
 * 捕获子组件树中的JavaScript错误，并显示降级UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    })

    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 可以在这里记录错误到错误监控服务
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    this.props.onRetry?.()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果有自定义fallback，使用自定义fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-[var(--bg-main)] rounded-lg border border-[var(--border-line)]">
          <div className="text-center">
            {/* 错误图标 */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* 错误标题 */}
            <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
              {this.props.errorMessage || '出错了'}
            </h3>

            {/* 错误详情（开发环境显示） */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 p-3 bg-red-50 rounded border border-red-200 text-left">
                <p className="text-sm font-medium text-red-800 mb-1">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-red-600 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-[var(--bg-input)] text-[var(--mclaren-orange)] rounded-lg font-medium hover:bg-[var(--bg-hover)] transition-colors duration-200"
              >
                返回上一页
              </button>
              {this.props.showRetry && (
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-[var(--mclaren-orange)] text-white rounded-lg font-medium hover:brightness-110 transition-colors duration-200"
                >
                  重试
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg font-medium hover:bg-[var(--bg-hover)] transition-colors duration-200"
              >
                刷新页面
              </button>
            </div>

            {/* 联系支持 */}
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              如果问题持续存在，请联系技术支持
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

/**
 * 错误边界HOC（高阶组件）
 * @param Component 要包装的组件
 * @param errorBoundaryProps 错误边界配置
 * @returns 包装后的组件
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  // 设置显示名称以便调试
  const componentName = Component.displayName || Component.name || 'Component'
  WrappedComponent.displayName = `withErrorBoundary(${componentName})`

  return WrappedComponent
}

/**
 * 错误边界提供者 - 用于在应用顶层包裹整个应用
 */
export const ErrorBoundaryProvider: React.FC<{
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      onError={onError}
      errorMessage="应用发生错误"
      showRetry={true}
      onRetry={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  )
}