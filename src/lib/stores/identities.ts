// src/lib/stores/identities.ts
import { create } from 'zustand'
import { db } from '@/lib/db'
import type { UserIdentity } from '@/types'
import { generateId } from '@/lib/utils/id'

interface IdentitiesState {
  identities: UserIdentity[]
  isLoaded: boolean

  loadIdentities: () => Promise<void>
  createIdentity: (data: Omit<UserIdentity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserIdentity>
  updateIdentity: (id: string, data: Partial<UserIdentity>) => Promise<void>
  deleteIdentity: (id: string) => Promise<void>
  getIdentity: (id: string) => UserIdentity | undefined
  getRealSelfIdentity: () => UserIdentity | undefined
}

export const useIdentitiesStore = create<IdentitiesState>((set, get) => ({
  identities: [],
  isLoaded: false,

  loadIdentities: async () => {
    const identities = await db.userIdentities.orderBy('createdAt').toArray()
    set({ identities, isLoaded: true })
  },

  createIdentity: async (data) => {
    const now = Date.now()
    
    // 如果设置为真实自己，取消其他身份的 isRealSelf
    if (data.isRealSelf) {
      await db.userIdentities.toCollection().modify({ isRealSelf: false })
    }

    const identity: UserIdentity = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    await db.userIdentities.add(identity)
    
    if (data.isRealSelf) {
      const allIdentities = await db.userIdentities.toArray()
      set({ identities: allIdentities })
    } else {
      set((state) => ({ identities: [...state.identities, identity] }))
    }
    
    return identity
  },

  updateIdentity: async (id, data) => {
    const updatedAt = Date.now()
    
    // 如果设置为真实自己，取消其他身份的 isRealSelf
    if (data.isRealSelf) {
      await db.userIdentities.toCollection().modify({ isRealSelf: false })
    }

    await db.userIdentities.update(id, { ...data, updatedAt })
    
    const allIdentities = await db.userIdentities.toArray()
    set({ identities: allIdentities })
  },

  deleteIdentity: async (id) => {
    await db.userIdentities.delete(id)
    set((state) => ({
      identities: state.identities.filter((i) => i.id !== id),
    }))
  },

  getIdentity: (id) => {
    return get().identities.find((i) => i.id === id)
  },

  getRealSelfIdentity: () => {
    return get().identities.find((i) => i.isRealSelf)
  },
}))
