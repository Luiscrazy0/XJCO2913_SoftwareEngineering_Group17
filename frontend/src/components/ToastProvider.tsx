import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const TOAST_TIMEOUT = 3800

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, TOAST_TIMEOUT)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  const getToastStyle = (type: ToastType) => {
    const baseStyle = 'bg-[#111827] border-[#FF6A00]/60 text-slate-100'
    switch (type) {
      case 'success':
        return `${baseStyle} text-emerald-200`
      case 'error':
        return `${baseStyle} text-rose-200`
      default:
        return `${baseStyle} text-sky-200`
    }
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`border shadow-sm rounded-md px-4 py-3 text-sm font-medium ${getToastStyle(toast.type)}`}
            role="alert"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
