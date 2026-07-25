// src/components/ui/Card.tsx
'use client'

import { clsx } from 'clsx'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'glass rounded-2xl p-4',
        onClick && 'cursor-pointer hover:bg-white/5 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
