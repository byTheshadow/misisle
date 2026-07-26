'use client'

import { useEffect } from 'react'
import { AppGrid } from './AppGrid'
import { HomeWidgets } from './HomeWidgets'
import { useSettingsStore } from '@/lib/stores/settings'

export function HomeScreen() {
  const { isLoaded, loadSettings } = useSettingsStore()

  useEffect(() => {
    if (!isLoaded) {
      void loadSettings()
    }
  }, [isLoaded, loadSettings])

  return (
    <main className="min-h-screen p-6 pb-12">
      <header className="mb-6">
        <p className="text-xs tracking-[0.35em] text-mist-text-secondary uppercase">
          Misisle
        </p>
        <h1 className="text-3xl font-light text-mist-text mt-2">雾屿</h1>
        <p className="text-sm text-mist-text-secondary mt-2">
          一座安静的数字小家。
        </p>
      </header>

      <section className="mb-8">
        <HomeWidgets />
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-light text-mist-text">应用</h2>
            <p className="text-xs text-mist-text-secondary mt-1">
              进入不同房间，继续你的陪伴生态。
            </p>
          </div>
        </div>

        <AppGrid />
      </section>
    </main>
  )
}
