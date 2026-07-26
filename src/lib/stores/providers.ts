// src/lib/stores/providers.ts
import { create } from 'zustand'
import type { AIProvider } from '@/types'
import {
  createProvider as dbCreateProvider,
  updateProvider as dbUpdateProvider,
  deleteProvider as dbDeleteProvider,
  getAllProviders,
  fetchModels as apiFetchModels,
  testProviderConnection as apiTestProviderConnection,
} from '@/lib/ai/provider'

interface ProvidersState {
  providers: AIProvider[]
  isLoaded: boolean

  loadProviders: () => Promise<void>
  createProvider: (data: Omit<AIProvider, 'id' | 'models' | 'createdAt' | 'updatedAt'>) => Promise<AIProvider>
  updateProvider: (id: string, data: Partial<AIProvider>) => Promise<void>
  deleteProvider: (id: string) => Promise<void>
  fetchModels: (id: string) => Promise<string[]>
  testConnection: (id: string) => Promise<boolean>
}

export const useProvidersStore = create<ProvidersState>((set, get) => ({
  providers: [],
  isLoaded: false,

  loadProviders: async () => {
    const providers = await getAllProviders()
    set({ providers, isLoaded: true })
  },

  createProvider: async (data) => {
    const provider = await dbCreateProvider(data)
    set((state) => ({ providers: [...state.providers, provider] }))
    return provider
  },

  updateProvider: async (id, data) => {
    await dbUpdateProvider(id, data)
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
      ),
    }))
  },

  deleteProvider: async (id) => {
    await dbDeleteProvider(id)
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
    }))
  },

  fetchModels: async (id) => {
    const provider = get().providers.find((p) => p.id === id)
    if (!provider) throw new Error('Provider not found')

    const models = await apiFetchModels(provider)
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, models, updatedAt: Date.now() } : p
      ),
    }))
    return models
  },

  testConnection: async (id) => {
    const provider = get().providers.find((p) => p.id === id)
    if (!provider) throw new Error('Provider not found')

    await apiTestProviderConnection(provider)
    return true
  },
}))

