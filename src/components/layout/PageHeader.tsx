// src/components/layout/PageHeader.tsx
'use client'

import Link from 'next/link'
import { IconBack, IconMore } from '@/components/icons'

interface PageHeaderProps {
  title: string
  backHref?: string
  onBack?: () => void
  actions?: React.ReactNode
}

export function PageHeader({ title, backHref, onBack, actions }: PageHeaderProps) {
  const BackButton = () => (
    <button
      onClick={onBack}
      className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <IconBack className="w-5 h-5 text-mist-text" />
    </button>
  )

  const BackLink = () => (
    <Link
      href={backHref!}
      className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <IconBack className="w-5 h-5 text-mist-text" />
    </Link>
  )

  return (
    <header className="flex items-center justify-between h-14 px-4 glass border-b border-mist-border">
      <div className="flex items-center gap-2">
        {backHref ? <BackLink /> : onBack ? <BackButton /> : null}
        <h1 className="text-lg font-medium text-mist-text">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
