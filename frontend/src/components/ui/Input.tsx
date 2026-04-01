import { InputHTMLAttributes, ReactNode, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  rightElement?: ReactNode
}

export default function Input({
  label,
  hint,
  error,
  rightElement,
  id,
  className = '',
  ...props
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-main)]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          className={`w-full rounded-xl border border-[var(--border-line)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-main)] transition focus:border-[var(--mclaren-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20 ${className}`}
          {...props}
        />
        {rightElement ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
            {rightElement}
          </div>
        ) : null}
      </div>
      {error ? (
        <span className="text-xs text-rose-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[var(--text-secondary)]">{hint}</span>
      ) : null}
    </div>
  )
}
