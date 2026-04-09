import React, { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

interface ToastProps {
  /** 消息内容 */
  message: string
  /** 消息类型 */
  type: ToastType
  /** 持续时间（毫秒），0表示不自动关闭 */
  duration?: number
  /** 关闭回调 */
  onClose: () => void
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 标题 */
  title?: string
  /** 自定义图标 */
  icon?: React.ReactNode
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 5000,
  onClose,
  showClose = true,
  title,
  icon,
}) => {
  const [isExiting, setIsExiting] = useState(false)

  // 自动关闭
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300) // 等待退出动画完成
  }

  // 类型样式映射
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }

  const styles = typeStyles[type]

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 mb-3
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        max-w-sm w-full
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        {/* 图标 */}
        <div className={`flex-shrink-0 ${styles.text} mr-3`}>
          {icon || styles.icon}
        </div>

        {/* 内容 */}
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${styles.text}`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${styles.text}`}>
            {message}
          </p>
        </div>

        {/* 关闭按钮 */}
        {showClose && (
          <button
            onClick={handleClose}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭通知"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 进度条 */}
      {duration > 0 && (
        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.bg.replace('50', '400')} transition-all duration-${duration} ease-linear`}
            style={{
              width: isExiting ? '0%' : '100%',
              transitionDuration: `${duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Toast

// Toast上下文和管理器
interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
  title?: string
  icon?: React.ReactNode
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
  hideToast: (id: string) => void
  hideAllToasts: () => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast必须在ToastProvider内使用')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  position?: ToastPosition
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }

    setToasts((prev) => {
      const updated = [newToast, ...prev]
      // 限制最大显示数量
      if (updated.length > maxToasts) {
        return updated.slice(0, maxToasts)
      }
      return updated
    })
  }

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const hideAllToasts = () => {
    setToasts([])
  }

  // 位置样式映射
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      
      {/* Toast容器 */}
      {toasts.length > 0 && (
        <div
          className={`fixed z-50 ${positionClasses[position]} flex flex-col items-end`}
          style={{
            maxWidth: position.includes('center') ? '90vw' : '400px',
          }}
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => hideToast(toast.id)}
              title={toast.title}
              icon={toast.icon}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

// 快捷方法
export const toast = {
  success: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'success', ...options },
    })
    window.dispatchEvent(event)
  },
  error: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'error', ...options },
    })
    window.dispatchEvent(event)
  },
  warning: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'warning', ...options },
    })
    window.dispatchEvent(event)
  },
  info: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'info', ...options },
    })
    window.dispatchEvent(event)
  },
}