import { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const baseClasses =
  'inline-flex items-center justify-center font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mclaren-orange)]/40'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--mclaren-orange)] text-white border border-[#FFAC60] shadow-[var(--shadow-3d)] hover:brightness-110 active:translate-y-[2px]',
  secondary:
    'bg-transparent text-[var(--text-main)] border border-[var(--border-line)] hover:border-[var(--mclaren-orange)] hover:text-white',
  danger:
    'bg-rose-600 text-white border border-rose-500 hover:bg-rose-500',
  ghost:
    'bg-transparent text-[var(--text-main)] hover:bg-white/5',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

export default function Button({
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
}
