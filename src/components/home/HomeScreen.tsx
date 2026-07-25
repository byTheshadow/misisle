// src/components/home/HomeScreen.tsx
'use client'

import { AppGrid } from './AppGrid'

export function HomeScreen() {
  return (
    <main className="min-h-screen p-6">
      {/* 顶部标题区 */}
      <header className="mb-8">
        <h1 className="text-2xl font-light text-mist-text">雾屿</h1>
        <p className="text-sm text-mist-text-secondary mt-1">Misisle</p>
      </header>

      {/* App 入口网格 */}
      <AppGrid />
    </main>
  )
}
