import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`surface-card ${className}`}
      {...props}
    />
  )
}
