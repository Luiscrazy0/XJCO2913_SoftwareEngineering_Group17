import React from 'react'

interface LoadingSpinnerProps {
  /** 加载器大小 */
  size?: 'small' | 'medium' | 'large'
  /** 自定义类名 */
  className?: string
  /** 是否显示文字 */
  showText?: boolean
  /** 自定义文字 */
  text?: string
  /** 是否全屏显示 */
  fullScreen?: boolean
  /** 是否内联显示 */
  inline?: boolean
  /** 颜色 */
  color?: 'primary' | 'secondary' | 'white' | 'orange'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  showText = false,
  text = '加载中...',
  fullScreen = false,
  inline = false,
  color = 'orange',
}) => {
  // 尺寸映射
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  }

  // 颜色映射
  const colorClasses = {
    primary: 'border-[var(--text-main)] border-t-transparent',
    secondary: 'border-[var(--text-secondary)] border-t-transparent',
    white: 'border-white border-t-transparent',
    orange: 'border-[var(--mclaren-orange)] border-t-transparent',
  }

  // 全屏容器
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin mx-auto`}
          />
          {showText && (
            <p className="mt-4 text-white text-sm font-medium">{text}</p>
          )}
        </div>
      </div>
    )
  }

  // 内联显示
  if (inline) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
        />
        {showText && (
          <span className="ml-2 text-sm text-[var(--text-secondary)]">
            {text}
          </span>
        )}
      </div>
    )
  }

  // 默认块级显示
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      />
      {showText && (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner

// 骨架屏组件
interface SkeletonProps {
  /** 骨架屏类型 */
  type?: 'text' | 'card' | 'circle' | 'rectangle'
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 圆角 */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /** 是否显示动画 */
  animated?: boolean
  /** 自定义类名 */
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  width,
  height,
  rounded = 'md',
  animated = true,
  className = '',
}) => {
  // 圆角类
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  // 类型对应的默认尺寸
  const getDefaultDimensions = () => {
    switch (type) {
      case 'text':
        return { width: '100%', height: '1rem' }
      case 'card':
        return { width: '100%', height: '200px' }
      case 'circle':
        return { width: '3rem', height: '3rem' }
      case 'rectangle':
        return { width: '100%', height: '150px' }
      default:
        return { width: '100%', height: '1rem' }
    }
  }

  const defaultDims = getDefaultDimensions()
  const finalWidth = width || defaultDims.width
  const finalHeight = height || defaultDims.height

  // 动画类
  const animationClass = animated ? 'animate-pulse' : ''

  return (
    <div
      className={`bg-[var(--bg-input)] ${roundedClasses[rounded]} ${animationClass} ${className}`}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
      }}
    />
  )
}

// 骨架屏组 - 用于构建复杂的骨架屏布局
interface SkeletonGroupProps {
  /** 骨架屏配置数组 */
  items: Array<{
    type: SkeletonProps['type']
    width?: string | number
    height?: string | number
    rounded?: SkeletonProps['rounded']
    className?: string
  }>
  /** 是否显示动画 */
  animated?: boolean
  /** 容器类名 */
  containerClassName?: string
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  items,
  animated = true,
  containerClassName = '',
}) => {
  return (
    <div className={`space-y-3 ${containerClassName}`}>
      {items.map((item, index) => (
        <Skeleton
          key={index}
          type={item.type}
          width={item.width}
          height={item.height}
          rounded={item.rounded}
          animated={animated}
          className={item.className}
        />
      ))}
    </div>
  )
}