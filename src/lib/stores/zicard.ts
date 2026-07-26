import { create } from 'zustand'
import { db } from '@/lib/db'
import type {
  Character,
  ZicardDiaryEntry,
  ZicardExportPackage,
  ZicardFragment,
  ZicardLibrary,
  ZicardMessage,
  ZicardSession,
  ZicardTrace,
} from '@/types'
import { generateId } from '@/lib/utils/id'
import {
  generateDeepRandomZicardMessages,
  shouldRandomlyAskToSaveMessage,
} from '@/lib/utils/zicardRandom'

interface ZicardState {
  sessions: ZicardSession[]
  currentSession: ZicardSession | null
  messages: ZicardMessage[]
  libraries: ZicardLibrary[]
  fragments: ZicardFragment[]
  traces: ZicardTrace[]
  diaries: ZicardDiaryEntry[]

  isLoaded: boolean
  isTyping: boolean
  replyingSessionId: string | null
  lastAskToSaveAt: number | null

  loadAll: () => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  selectSession: (sessionId: string) => Promise<void>
  acceptSaveRequest: (messageId: string) => Promise<void>
  rejectSaveRequest: (messageId: string) => Promise<void>

  createSessionFromCharacter: (character: Character) => Promise<ZicardSession>
  createLocalSession: (data: {
    name: string
    avatar?: string
    personality?: string
    description?: string
  }) => Promise<ZicardSession>

  createLibrary: (data: {
    name: string
    description?: string
    characterId?: string | null
  }) => Promise<ZicardLibrary>

  createTextFragment: (data: {
    libraryId: string
    text: string
    category?: string
    tags?: string[]
    kind?: ZicardFragment['kind']
  }) => Promise<ZicardFragment>

  sendUserMessage: (sessionId: string, content: string, quoteMessageId?: string | null) => Promise<void>
  generateCharacterReply: (sessionId: string) => Promise<void>

  deleteMessage: (messageId: string) => Promise<void>
  setQuoteTarget: (messageId: string | null) => ZicardMessage | null

  addTraceFromMessage: (messageId: string) => Promise<void>
  addDiaryFromMessage: (messageId: string) => Promise<void>

  drawTodayStatus: (sessionId: string) => Promise<void>

  exportSession: (sessionId: string) => Promise<ZicardExportPackage>
}

function getDefaultReplyDelay(): ZicardSession['replyDelay'] {
  return {
    type: 'instant',
    fixedMinutes: 0,
    minMinutes: 0,
    maxMinutes: 1,
  }
}

function getDefaultTheme(): ZicardSession['theme'] {
  return {
    background: '',
    userBubble: '',
    characterBubble: '',
    textColor: '',
  }
}

function normalizeTags(tags?: string[]) {
  return tags?.map((tag) => tag.trim()).filter(Boolean) ?? []
}

export const useZicardStore = create<ZicardState>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  libraries: [],
  fragments: [],
  traces: [],
  diaries: [],

  isLoaded: false,
  isTyping: false,
  replyingSessionId: null,
  lastAskToSaveAt: null,

  loadAll: async () => {
    const [sessions, messages, libraries, fragments, traces, diaries] = await Promise.all([
      db.zicardSessions.toArray(),
      db.zicardMessages.toArray(),
      db.zicardLibraries.toArray(),
      db.zicardFragments.toArray(),
      db.zicardTraces.toArray(),
      db.zicardDiaries.toArray(),
    ])

    set({
      sessions,
      messages,
      libraries,
      fragments,
      traces,
      diaries,
      isLoaded: true,
    })
  },

  loadSession: async (sessionId) => {
    const [session, messages] = await Promise.all([
      db.zicardSessions.get(sessionId),
      db.zicardMessages.where('sessionId').equals(sessionId).sortBy('createdAt'),
    ])

    if (!session) return

    const [libraries, fragments, traces, diaries] = await Promise.all([
      db.zicardLibraries.toArray(),
      db.zicardFragments.toArray(),
      db.zicardTraces.toArray(),
      db.zicardDiaries.toArray(),
    ])

    set({
      currentSession: session,
      messages,
      libraries,
      fragments,
      traces,
      diaries,
      isLoaded: true,
    })
  },

  selectSession: async (sessionId) => {
    await get().loadSession(sessionId)
  },

  acceptSaveRequest: async (messageId) => {
    const message = get().messages.find((item) => item.id === messageId)
    if (!message || !message.requestAction) return

    const sourceMessage = get().messages.find(
      (item) => item.id === message.requestAction?.sourceMessageId
    )
    if (!sourceMessage) return

    const now = Date.now()

    const trace: ZicardTrace = {
      id: generateId(),
      sessionId: message.sessionId,
      source: 'user_message',
      sourceMessageId: sourceMessage.id,
      content: sourceMessage.content,
      excerpt: sourceMessage.content.slice(0, 30),
      tags: [],
      pinned: false,
      canEcho: true,
      createdAt: now,
      updatedAt: now,
    }

    const diary: ZicardDiaryEntry = {
      id: generateId(),
      sessionId: message.sessionId,
      title: '从用户留言生成',
      content: sourceMessage.content,
      source: 'message',
      sourceId: sourceMessage.id,
      mood: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
    }

    await db.transaction('rw', db.zicardTraces, db.zicardDiaries, db.zicardMessages, async () => {
      await db.zicardTraces.add(trace)
      await db.zicardDiaries.add(diary)
      await db.zicardMessages.update(messageId, {
        requestAction: {
          kind: 'save_user_message_as_zicard',
          sourceMessageId: message.requestAction.sourceMessageId,
          status: 'accepted',
        },
        updatedAt: now,
      })
    })

    set((state) => ({
      traces: [...state.traces, trace],
      diaries: [...state.diaries, diary],
      messages: state.messages.map((item) =>
        item.id === messageId
          ? {
              ...item,
              requestAction: {
                kind: 'save_user_message_as_zicard',
                sourceMessageId: message.requestAction!.sourceMessageId,
                status: 'accepted',
              },
              updatedAt: now,
            }
          : item
      ),
    }))
  },

  rejectSaveRequest: async (messageId) => {
    const message = get().messages.find((item) => item.id === messageId)
    if (!message || !message.requestAction) return

    const now = Date.now()

    await db.zicardMessages.update(messageId, {
      requestAction: {
        kind: 'save_user_message_as_zicard',
        sourceMessageId: message.requestAction.sourceMessageId,
        status: 'rejected',
      },
      updatedAt: now,
    })

    set((state) => ({
      messages: state.messages.map((item) =>
        item.id === messageId
          ? {
              ...item,
              requestAction: {
                kind: 'save_user_message_as_zicard',
                sourceMessageId: message.requestAction!.sourceMessageId,
                status: 'rejected',
              },
              updatedAt: now,
            }
          : item
      ),
    }))
  },

  createSessionFromCharacter: async (character) => {
    const now = Date.now()

    let globalLibrary = await db.zicardLibraries
      .where('characterId')
      .equals(null as any)
      .first()

    if (!globalLibrary) {
      globalLibrary = {
        id: generateId(),
        characterId: null,
        name: '通用字卡库',
        description: '全局可用的字卡资料库',
        createdAt: now,
        updatedAt: now,
      }
      await db.zicardLibraries.add(globalLibrary)
    }

    const session: ZicardSession = {
      id: generateId(),
      characterId: character.id,
      name: character.name,
      avatar: character.avatar,
      personality: character.personality,
      description: character.description,
      replyDelay: getDefaultReplyDelay(),
      theme: getDefaultTheme(),
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardSessions.add(session)

    set((state) => ({
      sessions: [...state.sessions, session],
      currentSession: session,
    }))

    return session
  },

  createLocalSession: async (data) => {
    const now = Date.now()

    const session: ZicardSession = {
      id: generateId(),
      characterId: null,
      name: data.name,
      avatar: data.avatar,
      personality: data.personality,
      description: data.description,
      replyDelay: getDefaultReplyDelay(),
      theme: getDefaultTheme(),
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardSessions.add(session)

    set((state) => ({
      sessions: [...state.sessions, session],
      currentSession: session,
    }))

    return session
  },

  createLibrary: async (data) => {
    const now = Date.now()

    const library: ZicardLibrary = {
      id: generateId(),
      characterId: data.characterId ?? null,
      name: data.name,
      description: data.description,
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardLibraries.add(library)

    set((state) => ({
      libraries: [...state.libraries, library],
    }))

    return library
  },

  createTextFragment: async (data) => {
    const now = Date.now()

    const fragment: ZicardFragment = {
      id: generateId(),
      libraryId: data.libraryId,
      text: data.text,
      category: data.category ?? '',
      tags: normalizeTags(data.tags),
      kind: data.kind ?? 'text',
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardFragments.add(fragment)

    set((state) => ({
      fragments: [...state.fragments, fragment],
    }))

    return fragment
  },

  sendUserMessage: async (sessionId, content, quoteMessageId) => {
    const now = Date.now()

    const message: ZicardMessage = {
      id: generateId(),
      sessionId,
      role: 'user',
      content,
      quoteMessageId: quoteMessageId ?? null,
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardMessages.add(message)

    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  generateCharacterReply: async (sessionId) => {
    // 省略其余原有实现
  },

  deleteMessage: async (messageId) => {
    // 省略其余原有实现
  },

  setQuoteTarget: (messageId) => {
    // 省略其余原有实现
    return null
  },

  addTraceFromMessage: async (messageId) => {
    // 省略其余原有实现
  },

  addDiaryFromMessage: async (messageId) => {
    // 省略其余原有实现
  },

  drawTodayStatus: async (sessionId) => {
    // 省略其余原有实现
  },

  exportSession: async (sessionId) => {
    // 省略其余原有实现
    return {
      sessionId,
      exportedAt: Date.now(),
      sessions: [],
      messages: [],
      libraries: [],
      fragments: [],
      traces: [],
      diaries: [],
    }
  },
}))
