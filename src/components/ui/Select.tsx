// src/components/ui/Select.tsx
'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-mist-text-secondary">{label}</label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-white/5 border border-mist-border',
            'text-mist-text',
            'focus:outline-none focus:border-mist-accent/50',
            'transition-colors appearance-none cursor-pointer',
            error && 'border-red-500/50',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-mist-surface">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    )
  }
)

Select.displayName = 'Select'
