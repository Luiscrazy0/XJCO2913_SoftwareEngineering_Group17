import { HTMLAttributes } from 'react'

type CardVariant = 'default' | 'glass' | 'interactive'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantClasses: Record<CardVariant, string> = {
  default: 'surface-card',
  glass: 'glass-card',
  interactive: 'surface-card surface-lift cursor-pointer',
}

export default function Card({ variant = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
