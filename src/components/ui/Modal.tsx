// src/components/ui/Modal.tsx
'use client'

import { useEffect } from 'react'
import { clsx } from 'clsx'
import { IconClose } from '@/components/icons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={clsx(
          'relative w-full max-w-lg max-h-[90vh] overflow-auto',
          'glass rounded-2xl p-6',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-mist-text">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <IconClose className="w-5 h-5 text-mist-text-secondary" />
            </button>
          </div>
        )}

        {/* Body */}
        {children}
      </div>
    </div>
  )
}
