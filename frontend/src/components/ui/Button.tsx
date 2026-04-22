import { ButtonHTMLAttributes, memo } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const baseClasses =
  'relative inline-flex items-center justify-center font-semibold rounded-xl transition-transform duration-150 ease-out disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mclaren-orange)]/40 motion-reduce:transform-none'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[linear-gradient(180deg,var(--mclaren-orange-hover),var(--mclaren-orange))] text-white border border-[#FFAC60] shadow-[var(--shadow-3d)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[var(--shadow-3d-hover)] active:translate-y-[1px]',
  secondary:
    'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-line)] hover:border-[var(--mclaren-orange)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]',
  danger:
    'bg-rose-600 text-white border border-rose-500 hover:bg-rose-500 hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-[var(--text-main)] hover:bg-white/5 hover:-translate-y-0.5',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '处理中...' : children}
    </button>
  )
})

export default Button

