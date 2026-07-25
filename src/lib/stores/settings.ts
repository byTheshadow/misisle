// src/lib/stores/settings.ts
import { create } from 'zustand'
import { db, initDefaultSettings } from '@/lib/db'
import type { GlobalSettings, BubbleStyle } from '@/types'

interface SettingsState {
  settings: GlobalSettings | null
  isLoaded: boolean
  
  // Actions
  loadSettings: () => Promise<void>
  updateSettings: (updates: Partial<GlobalSettings>) => Promise<void>
  updateBubbleStyle: (bubble: BubbleStyle) => Promise<void>
  updateCSSVariable: (key: string, value: string) => Promise<void>
  applyThemeToDOM: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoaded: false,

  loadSettings: async () => {
    await initDefaultSettings()
    const settings = await db.settings.get('global')
    if (settings) {
      const { id, ...rest } = settings
      set({ settings: rest as GlobalSettings, isLoaded: true })
      get().applyThemeToDOM()
    }
  },

  updateSettings: async (updates) => {
    const current = get().settings
    if (!current) return
    
    const newSettings = { ...current, ...updates }
    await db.settings.put({ id: 'global', ...newSettings })
    set({ settings: newSettings })
    get().applyThemeToDOM()
  },

  updateBubbleStyle: async (bubble) => {
    const current = get().settings
    if (!current) return
    
    const newSettings = { ...current, bubble }
    await db.settings.put({ id: 'global', ...newSettings })
    set({ settings: newSettings })
    get().applyThemeToDOM()
  },

  updateCSSVariable: async (key, value) => {
    const current = get().settings
    if (!current) return
    
    const cssVariables = { ...current.theme.cssVariables, [key]: value }
    const newSettings = {
      ...current,
      theme: { ...current.theme, cssVariables },
    }
    await db.settings.put({ id: 'global', ...newSettings })
    set({ settings: newSettings })
    get().applyThemeToDOM()
  },

  applyThemeToDOM: () => {
    const { settings } = get()
    if (!settings || typeof document === 'undefined') return

    const root = document.documentElement

    // 应用自定义 CSS 变量
    Object.entries(settings.theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 应用气泡样式变量
    const { bubble } = settings
    root.style.setProperty('--bubble-char-bg', bubble.character.bgColor)
    root.style.setProperty('--bubble-char-text', bubble.character.textColor)
    root.style.setProperty('--bubble-char-radius', bubble.character.borderRadius)
    root.style.setProperty('--bubble-user-bg', bubble.user.bgColor)
    root.style.setProperty('--bubble-user-text', bubble.user.textColor)
    root.style.setProperty('--bubble-user-radius', bubble.user.borderRadius)
    root.style.setProperty('--bubble-font-size', bubble.character.fontSize)
    root.style.setProperty('--bubble-font-family', bubble.character.fontFamily)

    // 应用自定义 CSS
    let styleEl = document.getElementById('misisle-custom-css')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'misisle-custom-css'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = settings.theme.customCSS
  },
}))
