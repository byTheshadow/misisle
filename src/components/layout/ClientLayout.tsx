// src/components/layout/ClientLayout.tsx
'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/lib/stores/settings'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { loadSettings, isLoaded } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-mist-text-secondary">加载中...</div>
      </div>
    )
  }

  return <>{children}</>
}
