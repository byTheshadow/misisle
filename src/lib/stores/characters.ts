// src/lib/stores/characters.ts
import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Character } from '@/types'
import { generateId } from '@/lib/utils/id'

interface CharactersState {
  characters: Character[]
  isLoaded: boolean

  loadCharacters: () => Promise<void>
  createCharacter: (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Character>
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
  getCharacter: (id: string) => Character | undefined
}

export const useCharactersStore = create<CharactersState>((set, get) => ({
  characters: [],
  isLoaded: false,

  loadCharacters: async () => {
    const characters = await db.characters.orderBy('createdAt').reverse().toArray()
    set({ characters, isLoaded: true })
  },

  createCharacter: async (data) => {
    const now = Date.now()
    const character: Character = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    await db.characters.add(character)
    set((state) => ({ characters: [character, ...state.characters] }))
    return character
  },

  updateCharacter: async (id, data) => {
    const updatedAt = Date.now()
    await db.characters.update(id, { ...data, updatedAt })
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt } : c
      ),
    }))
  },

  deleteCharacter: async (id) => {
    await db.characters.delete(id)
    // 同时删除关联数据
    await db.chats.where('characterId').equals(id).delete()
    await db.memories.where('characterId').equals(id).delete()
    await db.zicardLibraries.where('characterId').equals(id).delete()
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
    }))
  },

  getCharacter: (id) => {
    return get().characters.find((c) => c.id === id)
  },
}))
