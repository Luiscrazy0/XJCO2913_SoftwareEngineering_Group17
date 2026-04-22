import { HTMLAttributes, ElementType, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** 渲染的 HTML 标签，默认为 div */
  as?: ElementType
  /** 卡片变体 */
  variant?: 'default' | 'outlined'
}

const Card = forwardRef<HTMLElement, CardProps>(function Card({
  as: Component = 'div',
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps, ref) {
  const variantClass = variant === 'outlined' ? 'border border-[var(--border-line)]' : ''

  return (
    <Component
      ref={ref}
      className={`surface-card ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
})

export default Card

