// UI组件库入口文件
// 导出所有UI组件

// 基础组件
export { default as Badge } from './Badge'
export { default as Button } from './Button'
export { default as Card } from './Card'
export { default as Input } from './Input'

// 新增组件
export { default as LoadingSpinner } from './LoadingSpinner'
export { default as GlobalLoadingBar } from './GlobalLoadingBar'
export { default as ErrorBoundary, withErrorBoundary, ErrorBoundaryProvider } from './ErrorBoundary'
export { default as Modal, ConfirmModal, FormModal } from './Modal'
export { ToastProvider, useToast } from '../ToastProvider'
export { default as Skeleton, CardSkeleton, ListSkeleton, TableSkeleton, DetailSkeleton, FormSkeleton } from './Skeleton'

// 类型导出
export type {
  ToastType,
  ModalSize,
  ButtonVariant,
  BadgeVariant,
} from '../../types'