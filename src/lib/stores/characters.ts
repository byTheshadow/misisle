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
    await db.transaction(
      'rw',
      db.characters,
      db.chats,
      db.chatMessages,
      db.memories,
      db.zicardLibraries,
      db.zicardFragments,
      db.zicardSessions,
      db.zicardMessages,
      db.zicardUserNotes,
      db.zicardTraces,
      db.zicardDiaries,
      async () => {
        await db.characters.delete(id)

        const chatIds = (
          await db.chats.where('characterId').equals(id).toArray()
        ).map((chat) => chat.id)

        if (chatIds.length > 0) {
          await db.chatMessages.where('chatId').anyOf(chatIds).delete()
          await db.chats.where('id').anyOf(chatIds).delete()
        }

        await db.memories.where('characterId').equals(id).delete()

        const boundLibraryIds = (
          await db.zicardLibraries.where('characterId').equals(id).toArray()
        ).map((library) => library.id)

        if (boundLibraryIds.length > 0) {
          await db.zicardFragments.where('libraryId').anyOf(boundLibraryIds).delete()
          await db.zicardUserNotes.where('libraryId').anyOf(boundLibraryIds).delete()
          await db.zicardLibraries.where('id').anyOf(boundLibraryIds).delete()
        }

        const sessionIds = (
          await db.zicardSessions.where('characterId').equals(id).toArray()
        ).map((session) => session.id)

        if (sessionIds.length > 0) {
          await db.zicardMessages.where('sessionId').anyOf(sessionIds).delete()
          await db.zicardTraces.where('sessionId').anyOf(sessionIds).delete()
          await db.zicardDiaries.where('sessionId').anyOf(sessionIds).delete()
          await db.zicardUserNotes.where('sessionId').anyOf(sessionIds).delete()
          await db.zicardSessions.where('id').anyOf(sessionIds).delete()
        }
      }
    )

    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
    }))
  },

  getCharacter: (id) => {
    return get().characters.find((c) => c.id === id)
  },
}))
