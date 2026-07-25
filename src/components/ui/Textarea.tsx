// src/components/ui/Textarea.tsx
'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-mist-text-secondary">{label}</label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg resize-none',
            'bg-white/5 border border-mist-border',
            'text-mist-text placeholder:text-mist-text-secondary/50',
            'focus:outline-none focus:border-mist-accent/50',
            'transition-colors',
            error && 'border-red-500/50',
            className
          )}
          {...props}
        />
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
