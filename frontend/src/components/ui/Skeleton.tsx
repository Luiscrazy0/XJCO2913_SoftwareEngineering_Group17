import React from 'react'

interface SkeletonProps {
  /** 骨架屏类型 */
  type?: 'text' | 'card' | 'circle' | 'rectangle' | 'avatar' | 'button'
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
  /** 是否内联显示 */
  inline?: boolean
  /** 数量（用于生成多个骨架屏） */
  count?: number
  /** 骨架屏之间的间距 */
  gap?: string | number
}

const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  width,
  height,
  rounded = 'md',
  animated = true,
  className = '',
  inline = false,
  count = 1,
  gap = '0.5rem',
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
      case 'avatar':
        return { width: '2.5rem', height: '2.5rem' }
      case 'button':
        return { width: '6rem', height: '2.5rem' }
      default:
        return { width: '100%', height: '1rem' }
    }
  }

  const defaultDims = getDefaultDimensions()
  const finalWidth = width || defaultDims.width
  const finalHeight = height || defaultDims.height

  // 动画类
  const animationClass = animated ? 'animate-pulse' : ''

  // 单个骨架屏
  const SkeletonItem = () => (
    <div
      className={`bg-gradient-to-r from-[var(--bg-input)] via-[var(--bg-hover)] to-[var(--bg-input)] ${roundedClasses[rounded]} ${animationClass} ${className}`}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
        display: inline ? 'inline-block' : 'block',
        marginRight: inline && count > 1 ? gap : undefined,
        marginBottom: !inline && count > 1 ? gap : undefined,
      }}
    />
  )

  // 多个骨架屏
  if (count > 1) {
    if (inline) {
      return (
        <div className="flex items-center">
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </div>
      )
    }

    return (
      <div>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonItem key={index} />
        ))}
      </div>
    )
  }

  return <SkeletonItem />
}

export default Skeleton

// 预定义的骨架屏布局组件

/**
 * 卡片骨架屏
 */
export const CardSkeleton: React.FC<{
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 是否显示标题 */
  showTitle?: boolean
  /** 是否显示内容 */
  showContent?: boolean
  /** 是否显示操作按钮 */
  showActions?: boolean
  /** 内容行数 */
  contentLines?: number
  /** 自定义类名 */
  className?: string
}> = ({
  showAvatar = true,
  showTitle = true,
  showContent = true,
  showActions = true,
  contentLines = 3,
  className = '',
}) => {
  return (
    <div className={`bg-[var(--bg-main)] rounded-lg border border-[var(--border-line)] p-6 ${className}`}>
      {/* 头部 */}
      <div className="flex items-start mb-4">
        {showAvatar && (
          <Skeleton type="circle" className="mr-3 flex-shrink-0" />
        )}
        <div className="flex-1">
          {showTitle && (
            <div className="mb-2">
              <Skeleton type="text" width="60%" height="1.25rem" />
            </div>
          )}
          <Skeleton type="text" width="40%" height="0.875rem" />
        </div>
      </div>

      {/* 内容 */}
      {showContent && (
        <div className="space-y-2 mb-4">
          {Array.from({ length: contentLines }).map((_, index) => (
            <Skeleton
              key={index}
              type="text"
              width={index === contentLines - 1 ? '80%' : '100%'}
              height="0.875rem"
            />
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex space-x-3">
          <Skeleton type="button" width="5rem" />
          <Skeleton type="button" width="5rem" />
        </div>
      )}
    </div>
  )
}

/**
 * 列表骨架屏
 */
export const ListSkeleton: React.FC<{
  /** 项目数量 */
  itemCount?: number
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 是否显示副标题 */
  showSubtitle?: boolean
  /** 是否显示操作 */
  showActions?: boolean
  /** 自定义类名 */
  className?: string
}> = ({
  itemCount = 5,
  showAvatar = true,
  showSubtitle = true,
  showActions = true,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-lg border border-[var(--border-line)]"
        >
          <div className="flex items-center">
            {showAvatar && (
              <Skeleton type="avatar" className="mr-3" />
            )}
            <div>
              <Skeleton type="text" width="8rem" height="1rem" className="mb-2" />
              {showSubtitle && (
                <Skeleton type="text" width="12rem" height="0.75rem" />
              )}
            </div>
          </div>
          {showActions && (
            <Skeleton type="button" width="4rem" />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * 表格骨架屏
 */
export const TableSkeleton: React.FC<{
  /** 行数 */
  rows?: number
  /** 列数 */
  columns?: number
  /** 是否显示表头 */
  showHeader?: boolean
  /** 自定义类名 */
  className?: string
}> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
}) => {
  return (
    <div className={`overflow-hidden rounded-lg border border-[var(--border-line)] ${className}`}>
      {/* 表头 */}
      {showHeader && (
        <div className="bg-[var(--bg-input)] px-6 py-3 border-b border-[var(--border-line)]">
          <div className="flex">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="flex-1">
                <Skeleton type="text" width="80%" height="1rem" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 表格内容 */}
      <div className="divide-y divide-[var(--border-line)]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex items-center">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1">
                  <Skeleton
                    type="text"
                    width={colIndex === 0 ? '60%' : '80%'}
                    height="0.875rem"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 详情页骨架屏
 */
export const DetailSkeleton: React.FC<{
  /** 是否显示标题 */
  showTitle?: boolean
  /** 是否显示图片 */
  showImage?: boolean
  /** 字段数量 */
  fieldCount?: number
  /** 自定义类名 */
  className?: string
}> = ({
  showTitle = true,
  showImage = true,
  fieldCount = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题 */}
      {showTitle && (
        <div>
          <Skeleton type="text" width="40%" height="2rem" className="mb-2" />
          <Skeleton type="text" width="60%" height="1rem" />
        </div>
      )}

      {/* 图片 */}
      {showImage && (
        <Skeleton type="rectangle" height="300px" rounded="lg" />
      )}

      {/* 字段列表 */}
      <div className="space-y-4">
        {Array.from({ length: fieldCount }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton type="text" width="30%" height="0.875rem" />
            <Skeleton type="text" width="100%" height="1.25rem" />
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3 pt-4">
        <Skeleton type="button" width="6rem" />
        <Skeleton type="button" width="6rem" />
      </div>
    </div>
  )
}

/**
 * 表单骨架屏
 */
export const FormSkeleton: React.FC<{
  /** 字段数量 */
  fieldCount?: number
  /** 是否显示提交按钮 */
  showSubmit?: boolean
  /** 自定义类名 */
  className?: string
}> = ({
  fieldCount = 4,
  showSubmit = true,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fieldCount }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton type="text" width="25%" height="0.875rem" />
          <Skeleton type="text" width="100%" height="2.5rem" rounded="md" />
        </div>
      ))}

      {showSubmit && (
        <div className="pt-4">
          <Skeleton type="button" width="100%" height="2.75rem" />
        </div>
      )}
    </div>
  )
}