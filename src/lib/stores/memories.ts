// src/lib/stores/memories.ts
import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Memory } from '@/types'
import { generateId } from '@/lib/utils/id'

interface MemoriesState {
  memories: Memory[]
  isLoaded: boolean
  currentCharacterId: string | null

  loadMemoriesByCharacter: (characterId: string) => Promise<void>
  loadMemoriesByChat: (chatId: string) => Promise<Memory[]>
  createMemory: (data: Omit<Memory, 'id' | 'isUserEdited' | 'createdAt' | 'updatedAt'>) => Promise<Memory>
  updateMemory: (id: string, data: Partial<Memory>) => Promise<void>
  deleteMemory: (id: string) => Promise<void>
  getMemoriesForPrompt: (characterId: string, chatId: string | null, maxTokens: number) => Promise<Memory[]>
}

export const useMemoriesStore = create<MemoriesState>((set, get) => ({
  memories: [],
  isLoaded: false,
  currentCharacterId: null,

  loadMemoriesByCharacter: async (characterId) => {
    const memories = await db.memories
      .where('characterId')
      .equals(characterId)
      .reverse()
      .sortBy('createdAt')
    set({ memories, isLoaded: true, currentCharacterId: characterId })
  },

  loadMemoriesByChat: async (chatId) => {
    return db.memories
      .where('chatId')
      .equals(chatId)
      .reverse()
      .sortBy('createdAt')
  },

  createMemory: async (data) => {
    const now = Date.now()
    const memory: Memory = {
      id: generateId(),
      ...data,
      isUserEdited: false,
      createdAt: now,
      updatedAt: now,
    }
    await db.memories.add(memory)
    
    if (get().currentCharacterId === data.characterId) {
      set((state) => ({ memories: [memory, ...state.memories] }))
    }
    
    return memory
  },

  updateMemory: async (id, data) => {
    const updatedAt = Date.now()
    await db.memories.update(id, { ...data, isUserEdited: true, updatedAt })
    set((state) => ({
      memories: state.memories.map((m) =>
        m.id === id ? { ...m, ...data, isUserEdited: true, updatedAt } : m
      ),
    }))
  },

  deleteMemory: async (id) => {
    await db.memories.delete(id)
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }))
  },

  getMemoriesForPrompt: async (characterId, chatId, maxTokens) => {
    // 获取 critical 级别的记忆（全部注入）
    const criticalMemories = await db.memories
      .where('[characterId+importance]')
      .equals([characterId, 'critical'])
      .toArray()

    // 获取 high 级别的记忆
    const highMemories = await db.memories
      .where('[characterId+importance]')
      .equals([characterId, 'high'])
      .sortBy('updatedAt')

    // 获取当前聊天的近期记忆
    let chatMemories: Memory[] = []
    if (chatId) {
      chatMemories = await db.memories
        .where('chatId')
        .equals(chatId)
        .reverse()
        .limit(10)
        .toArray()
    }

    // 简单估算 token（粗略：1 字符 ≈ 0.5 token）
    const estimateTokens = (text: string) => Math.ceil(text.length * 0.5)
    
    let totalTokens = 0
    const result: Memory[] = []

    // 先加入 critical
    for (const m of criticalMemories) {
      const tokens = estimateTokens(m.content)
      if (totalTokens + tokens <= maxTokens) {
        result.push(m)
        totalTokens += tokens
      }
    }

    // 再加入聊天相关记忆
    for (const m of chatMemories) {
      if (result.some((r) => r.id === m.id)) continue
      const tokens = estimateTokens(m.content)
      if (totalTokens + tokens <= maxTokens) {
        result.push(m)
        totalTokens += tokens
      }
    }

    // 最后加入 high
    for (const m of highMemories.reverse()) {
      if (result.some((r) => r.id === m.id)) continue
      const tokens = estimateTokens(m.content)
      if (totalTokens + tokens <= maxTokens) {
        result.push(m)
        totalTokens += tokens
      }
    }

    return result
  },
}))
