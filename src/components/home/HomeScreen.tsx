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
    <main className="min-h-screen px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.32em] text-mist-text-secondary">
          Misisle
        </p>
        <h1 className="mt-2 text-3xl font-light tracking-tight text-mist-text">
          雾屿
        </h1>
      </header>

      <section className="mb-10">
        <HomeWidgets />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-light text-mist-text">应用</h2>
        </div>

        <AppGrid />
      </section>
    </main>
  )
}

