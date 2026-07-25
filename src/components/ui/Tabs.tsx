// src/components/ui/Tabs.tsx
'use client'

import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex gap-1 p-1 glass rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex-1 px-4 py-2 rounded-lg text-sm transition-colors',
            activeTab === tab.id
              ? 'bg-white/10 text-mist-text'
              : 'text-mist-text-secondary hover:text-mist-text'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
