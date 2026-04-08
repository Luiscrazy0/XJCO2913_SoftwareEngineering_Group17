import { HTMLAttributes } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  danger: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
  neutral: 'bg-slate-500/15 text-slate-200 border-slate-400/30',
  accent: 'bg-[rgba(255,106,0,0.18)] text-[var(--mclaren-orange)] border-[rgba(255,106,0,0.45)]',
}

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  neutral: 'bg-slate-400',
  accent: 'bg-[var(--mclaren-orange)]',
}

export default function Badge({
  variant = 'neutral',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot ? <span className={`h-2 w-2 rounded-full ${dotClasses[variant]}`} /> : null}
      {children}
    </span>
  )
}
