import { InputHTMLAttributes, ReactNode, useId, memo } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  rightElement?: ReactNode
}

const Input = memo(function Input({
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
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`surface-inset w-full px-4 py-3 text-sm text-[var(--text-main)] transition focus:border-[var(--mclaren-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20 ${className}`}
          {...props}
        />
        {rightElement ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
            {rightElement}
          </div>
        ) : null}
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-rose-400" role="alert">{error}</span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="text-xs text-[var(--text-secondary)]">{hint}</span>
      ) : null}
    </div>
  )
})

export default Input

