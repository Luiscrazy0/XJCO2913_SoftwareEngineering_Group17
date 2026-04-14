import React, { useEffect, useRef } from 'react'

interface ModalProps {
  /** 是否显示模态框 */
  isOpen: boolean
  /** 关闭模态框的回调 */
  onClose: () => void
  /** 模态框标题 */
  title?: string
  /** 模态框内容 */
  children: React.ReactNode
  /** 模态框尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean
  /** 是否点击背景关闭 */
  closeOnBackdropClick?: boolean
  /** 是否显示遮罩 */
  showOverlay?: boolean
  /** 自定义类名 */
  className?: string
  /** 是否禁用ESC关闭 */
  disableEscapeClose?: boolean
  /** 自定义底部内容 */
  footer?: React.ReactNode
  /** 是否显示加载状态 */
  isLoading?: boolean
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  showOverlay = true,
  className = '',
  disableEscapeClose = false,
  footer,
  isLoading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !disableEscapeClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 防止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, disableEscapeClose])

  // 处理点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnBackdropClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose()
    }
  }

  // 尺寸映射
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  }

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩层 */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}

      {/* 模态框容器 */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className={`${sizeClasses[size]} w-full bg-[var(--bg-main)] rounded-xl shadow-2xl animate-fadeIn ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* 加载状态遮罩 */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[var(--mclaren-orange)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 头部 */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-line)]">
              {title && (
                <h3
                  id="modal-title"
                  className="text-xl font-semibold text-[var(--text-main)]"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors duration-200"
                  aria-label="关闭模态框"
                >
                  <svg
                    className="w-5 h-5 text-[var(--text-secondary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* 内容区域 */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* 底部区域 */}
          {footer && (
            <div className="p-6 border-t border-[var(--border-line)] bg-[var(--bg-input)] rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Modal

/**
 * 确认对话框组件
 */
interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  /** 确认消息 */
  message: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮变体 */
  confirmVariant?: 'primary' | 'danger' | 'warning'
  /** 确认回调 */
  onConfirm: () => void | Promise<void>
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否正在确认中 */
  isConfirming?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary',
  onConfirm,
  showCancel = true,
  isConfirming = false,
  ...modalProps
}) => {
  const handleConfirm = async () => {
    await onConfirm()
    if (!isConfirming) {
      modalProps.onClose()
    }
  }

  // 确认按钮样式
  const confirmButtonClasses = {
    primary: 'bg-[var(--mclaren-orange)] hover:brightness-110',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
  }

  return (
    <Modal
      {...modalProps}
      footer={
        <div className="flex justify-end space-x-3">
          {showCancel && (
            <button
              onClick={modalProps.onClose}
              disabled={isConfirming}
              className="px-4 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg font-medium hover:bg-[var(--bg-hover)] transition-colors duration-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 ${confirmButtonClasses[confirmVariant]}`}
          >
            {isConfirming ? '处理中...' : confirmText}
          </button>
        </div>
      }
    >
      <div className="text-center">
        {/* 图标 */}
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
          {confirmVariant === 'danger' ? (
            <svg
              className="w-6 h-6"
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
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* 消息 */}
        <p className="text-lg text-[var(--text-main)] mb-2">{message}</p>
        
        {/* 警告信息 */}
        {confirmVariant === 'danger' && (
          <p className="text-sm text-red-600 mt-2">
            此操作不可撤销，请谨慎操作
          </p>
        )}
      </div>
    </Modal>
  )
}

/**
 * 表单模态框组件
 */
interface FormModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  /** 表单内容 */
  formContent: React.ReactNode
  /** 提交按钮文本 */
  submitText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 提交回调 */
  onSubmit: () => void | Promise<void>
  /** 是否正在提交 */
  isSubmitting?: boolean
  /** 表单是否有效 */
  isValid?: boolean
}

export const FormModal: React.FC<FormModalProps> = ({
  formContent,
  submitText = '提交',
  cancelText = '取消',
  onSubmit,
  isSubmitting = false,
  isValid = true,
  ...modalProps
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit()
  }

  return (
    <Modal
      {...modalProps}
      footer={
        <div className="flex justify-end space-x-3">
          <button
            onClick={modalProps.onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg font-medium hover:bg-[var(--bg-hover)] transition-colors duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="px-4 py-2 bg-[var(--mclaren-orange)] text-white rounded-lg font-medium hover:brightness-110 transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? '提交中...' : submitText}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    </Modal>
  )
}