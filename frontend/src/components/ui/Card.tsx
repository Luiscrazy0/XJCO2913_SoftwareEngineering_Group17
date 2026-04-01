import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] ${className}`}
      {...props}
    />
  )
}
