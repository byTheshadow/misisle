import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Character } from '@/types'
import { generateId } from '@/lib/utils/id'

interface CharactersState {
  characters: Character[]
  isLoaded: boolean

  loadCharacters: () => Promise<void>
  createCharacter: (
    data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Character>
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

    set((state) => ({
      characters: [character, ...state.characters],
    }))

    return character
  },

  updateCharacter: async (id, data) => {
    const updatedAt = Date.now()

    await db.characters.update(id, {
      ...data,
      updatedAt,
    })

    set((state) => ({
      characters: state.characters.map((character) =>
        character.id === id
          ? { ...character, ...data, updatedAt }
          : character
      ),
    }))
  },

  deleteCharacter: async (id) => {
    await db.transaction(
      'rw',
      [
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
      ],
      async () => {
        await db.characters.delete(id)

        // 删除普通 AI 聊天及其消息。
        const chats = await db.chats.where('characterId').equals(id).toArray()
        const chatIds = chats.map((chat) => chat.id)

        if (chatIds.length > 0) {
          await db.chatMessages.where('chatId').anyOf(chatIds).delete()
          await db.chats.where('id').anyOf(chatIds).delete()
        }

        // 删除此角色的 AI 记忆。
        await db.memories.where('characterId').equals(id).delete()

        /**
         * 仅删除直接绑定这个角色的字卡库。
         *
         * 通用字卡库使用 characterId: null，
         * 因此不会被这里的规则删除。
         */
        const boundLibraries = await db.zicardLibraries
          .where('characterId')
          .equals(id)
          .toArray()

        const boundLibraryIds = boundLibraries.map((library) => library.id)

        if (boundLibraryIds.length > 0) {
          await db.zicardFragments.where('libraryId').anyOf(boundLibraryIds).delete()
          await db.zicardUserNotes.where('libraryId').anyOf(boundLibraryIds).delete()
          await db.zicardLibraries.where('id').anyOf(boundLibraryIds).delete()
        }

        // 删除引用此全局角色的字卡消息框及会话内数据。
        const zicardSessions = await db.zicardSessions
          .where('characterId')
          .equals(id)
          .toArray()

        const zicardSessionIds = zicardSessions.map((session) => session.id)

        if (zicardSessionIds.length > 0) {
          await db.zicardMessages.where('sessionId').anyOf(zicardSessionIds).delete()
          await db.zicardUserNotes.where('sessionId').anyOf(zicardSessionIds).delete()
          await db.zicardTraces.where('sessionId').anyOf(zicardSessionIds).delete()
          await db.zicardDiaries.where('sessionId').anyOf(zicardSessionIds).delete()
          await db.zicardSessions.where('id').anyOf(zicardSessionIds).delete()
        }
      }
    )

    set((state) => ({
      characters: state.characters.filter((character) => character.id !== id),
    }))
  },

  getCharacter: (id) => {
    return get().characters.find((character) => character.id === id)
  },
}))
