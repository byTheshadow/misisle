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
    const [sessions, libraries, fragments] = await Promise.all([
      db.zicardSessions.orderBy('lastMessageAt').reverse().toArray(),
      db.zicardLibraries.orderBy('createdAt').reverse().toArray(),
      db.zicardFragments.orderBy('createdAt').reverse().toArray(),
    ])

    set({
      sessions,
      libraries,
      fragments,
      isLoaded: true,
    })
  },

  loadSession: async (sessionId) => {
    const [session, messages, libraries, fragments, traces, diaries] = await Promise.all([
      db.zicardSessions.get(sessionId),
      db.zicardMessages.where('sessionId').equals(sessionId).sortBy('createdAt'),
      db.zicardLibraries.orderBy('createdAt').reverse().toArray(),
      db.zicardFragments.orderBy('createdAt').reverse().toArray(),
      db.zicardTraces.where('sessionId').equals(sessionId).sortBy('createdAt'),
      db.zicardDiaries.where('sessionId').equals(sessionId).sortBy('createdAt'),
    ])

    set({
      currentSession: session ?? null,
      messages,
      libraries,
      fragments,
      traces,
      diaries,
    })
  },

  selectSession: async (sessionId) => {
    await get().loadSession(sessionId)
  },

    acceptSaveRequest: async (messageId) => {
    const message = get().messages.find((item) => item.id === messageId)
    if (!message || !message.requestAction) return

    const sourceMessageId = message.requestAction.sourceMessageId

    const sourceMessage = get().messages.find(
      (item) => item.id === sourceMessageId
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
          sourceMessageId,
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
                sourceMessageId,
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

    const sourceMessageId = message.requestAction.sourceMessageId
    const now = Date.now()

    await db.zicardMessages.update(messageId, {
      requestAction: {
        kind: 'save_user_message_as_zicard',
        sourceMessageId,
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
                sourceMessageId,
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
        description: '所有角色都可以使用的通用字卡。',
        scope: 'global',
        createdAt: now,
        updatedAt: now,
        settings: {
          enableKeywordTrigger: false,
          autoWeather: false,
          manualWeather: '',
          replyDelayMin: 0,
          replyDelayMax: 1,
          allowMultiBubble: true,
          allowCombinedBubble: true,
        },
      }

      await db.zicardLibraries.add(globalLibrary)
    }

    const session: ZicardSession = {
      id: generateId(),
      characterSource: 'global_character',
      characterId: character.id,
      localCharacter: null,
      userIdentityId: null,
      title: character.name,
      avatar: character.avatar,
      libraryIds: [globalLibrary.id],
      mode: 'deep_random',
      typingIndicatorText: '正在输入…',
      replyDelay: getDefaultReplyDelay(),
      theme: getDefaultTheme(),
      todayStatus: null,
      lastMessage: '',
      lastMessageAt: now,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardSessions.add(session)

    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session,
    }))

    return session
  },

  createLocalSession: async (data) => {
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
        description: '所有角色都可以使用的通用字卡。',
        scope: 'global',
        createdAt: now,
        updatedAt: now,
        settings: {
          enableKeywordTrigger: false,
          autoWeather: false,
          manualWeather: '',
          replyDelayMin: 0,
          replyDelayMax: 1,
          allowMultiBubble: true,
          allowCombinedBubble: true,
        },
      }

      await db.zicardLibraries.add(globalLibrary)
    }

    const session: ZicardSession = {
      id: generateId(),
      characterSource: 'zicard_local',
      characterId: null,
      localCharacter: {
        name: data.name,
        avatar: data.avatar ?? '',
        personality: data.personality ?? '',
        description: data.description ?? '',
      },
      userIdentityId: null,
      title: data.name,
      avatar: data.avatar ?? '',
      libraryIds: [globalLibrary.id],
      mode: 'deep_random',
      typingIndicatorText: '正在输入…',
      replyDelay: getDefaultReplyDelay(),
      theme: getDefaultTheme(),
      todayStatus: null,
      lastMessage: '',
      lastMessageAt: now,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardSessions.add(session)

    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session,
    }))

    return session
  },

  createLibrary: async (data) => {
    const now = Date.now()
    const characterId = data.characterId ?? null

    const library: ZicardLibrary = {
      id: generateId(),
      characterId,
      name: data.name,
      description: data.description ?? '',
      scope: characterId ? 'character_bound' : 'global',
      createdAt: now,
      updatedAt: now,
      settings: {
        enableKeywordTrigger: false,
        autoWeather: false,
        manualWeather: '',
        replyDelayMin: 0,
        replyDelayMax: 1,
        allowMultiBubble: true,
        allowCombinedBubble: true,
      },
    }

    await db.zicardLibraries.add(library)

    set((state) => ({
      libraries: [library, ...state.libraries],
    }))

    return library
  },

  createTextFragment: async (data) => {
    const now = Date.now()

    const fragment: ZicardFragment = {
      id: generateId(),
      libraryId: data.libraryId,
      kind: data.kind ?? 'text',
      position: 'single',
      text: data.text,
      category: data.category ?? '普通',
      tags: normalizeTags(data.tags),
      weight: 1,
      enabled: true,
      conditions: {
        timeSlots: [],
        weather: [],
        dates: [],
        keywords: [],
      },
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardFragments.add(fragment)

    set((state) => ({
      fragments: [fragment, ...state.fragments],
    }))

    return fragment
  },

  sendUserMessage: async (sessionId, content, quoteMessageId = null) => {
    const now = Date.now()
    const state = get()

    const quoteSource = quoteMessageId
      ? state.messages.find((message) => message.id === quoteMessageId)
      : null

    const userMessage: ZicardMessage = {
      id: generateId(),
      sessionId,
      sender: 'user',
      type: 'text',
      content,
      zicardIds: [],
      responseGroupId: null,
      quote: quoteSource
        ? {
            messageId: quoteSource.id,
            sender: quoteSource.sender,
            content: quoteSource.content,
          }
        : null,
      isRead: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardMessages.add(userMessage)

    await db.zicardSessions.update(sessionId, {
      lastMessage: content,
      lastMessageAt: now,
      updatedAt: now,
    })

    set((current) => ({
      messages: [...current.messages, userMessage],
      sessions: current.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              lastMessage: content,
              lastMessageAt: now,
              updatedAt: now,
            }
          : session
      ),
      currentSession:
        current.currentSession?.id === sessionId
          ? {
              ...current.currentSession,
              lastMessage: content,
              lastMessageAt: now,
              updatedAt: now,
            }
          : current.currentSession,
    }))

    const shouldAsk = shouldRandomlyAskToSaveMessage({
      userContent: content,
      lastAskedAt: get().lastAskToSaveAt,
      now,
    })

    if (shouldAsk) {
      const requestMessage: ZicardMessage = {
        id: generateId(),
        sessionId,
        sender: 'character',
        type: 'zicard-request',
        content: '这句话……我可以留下来吗？',
        zicardIds: [],
        responseGroupId: null,
        quote: null,
        requestAction: {
          kind: 'save_user_message_as_zicard',
          sourceMessageId: userMessage.id,
          status: 'pending',
        },
        isRead: true,
        deletedAt: null,
        createdAt: now + 1,
        updatedAt: now + 1,
      }

      await db.zicardMessages.add(requestMessage)

      set((current) => ({
        messages: [...current.messages, requestMessage],
        lastAskToSaveAt: now,
      }))

      return
    }

    await get().generateCharacterReply(sessionId)
  },

  generateCharacterReply: async (sessionId) => {
    const session = await db.zicardSessions.get(sessionId)
    if (!session) return

    set({
      isTyping: true,
      replyingSessionId: sessionId,
    })

    const delayMs =
      session.replyDelay.type === 'instant'
        ? 500
        : session.replyDelay.type === 'fixed'
          ? Math.max(0, session.replyDelay.fixedMinutes) * 60 * 1000
          : Math.max(
              0,
              Math.floor(
                (session.replyDelay.minMinutes +
                  Math.random() *
                    Math.max(0, session.replyDelay.maxMinutes - session.replyDelay.minMinutes)) *
                  60 *
                  1000
              )
            )

    await new Promise((resolve) => window.setTimeout(resolve, delayMs))

    const allFragments = await db.zicardFragments.toArray()

    const availableFragments = allFragments.filter((fragment) =>
      session.libraryIds.includes(fragment.libraryId)
    )

    const result = generateDeepRandomZicardMessages({
      sessionId,
      fragments: availableFragments,
    })

    const now = Date.now()

    const messages: ZicardMessage[] = result.messages.map((message, index) => ({
      id: generateId(),
      ...message,
      createdAt: now + index,
      updatedAt: now + index,
    }))

    await db.zicardMessages.bulkAdd(messages)

    const lastMessage = messages[messages.length - 1]?.content ?? ''

    await db.zicardSessions.update(sessionId, {
      lastMessage,
      lastMessageAt: now,
      updatedAt: now,
    })

    set((state) => ({
      messages: [...state.messages, ...messages],
      sessions: state.sessions.map((item) =>
        item.id === sessionId
          ? {
              ...item,
              lastMessage,
              lastMessageAt: now,
              updatedAt: now,
            }
          : item
      ),
      currentSession:
        state.currentSession?.id === sessionId
          ? {
              ...state.currentSession,
              lastMessage,
              lastMessageAt: now,
              updatedAt: now,
            }
          : state.currentSession,
      isTyping: false,
      replyingSessionId: null,
    }))
  },

  deleteMessage: async (messageId) => {
    const now = Date.now()

    await db.zicardMessages.update(messageId, {
      deletedAt: now,
      updatedAt: now,
    })

    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              deletedAt: now,
              updatedAt: now,
            }
          : message
      ),
    }))
  },

  setQuoteTarget: (messageId) => {
    if (!messageId) return null
    return get().messages.find((message) => message.id === messageId) ?? null
  },

  addTraceFromMessage: async (messageId) => {
    const message = get().messages.find((item) => item.id === messageId)
    if (!message) return

    const now = Date.now()

    const trace: ZicardTrace = {
      id: generateId(),
      sessionId: message.sessionId,
      source: message.sender === 'user' ? 'user_message' : 'past_event',
      sourceMessageId: message.id,
      content: message.content,
      excerpt: message.content.slice(0, 30),
      tags: [],
      pinned: false,
      canEcho: true,
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardTraces.add(trace)

    set((state) => ({
      traces: [...state.traces, trace],
    }))
  },

  addDiaryFromMessage: async (messageId) => {
    const message = get().messages.find((item) => item.id === messageId)
    if (!message) return

    const now = Date.now()

    const diary: ZicardDiaryEntry = {
      id: generateId(),
      sessionId: message.sessionId,
      title: '从消息生成的日记',
      content: message.content,
      source: 'message',
      sourceId: message.id,
      mood: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
    }

    await db.zicardDiaries.add(diary)

    set((state) => ({
      diaries: [...state.diaries, diary],
    }))
  },

  drawTodayStatus: async (sessionId) => {
    const session = await db.zicardSessions.get(sessionId)
    if (!session) return

    const fragments = await db.zicardFragments.toArray()
    const statusFragments = fragments.filter(
      (fragment) =>
        session.libraryIds.includes(fragment.libraryId) &&
        fragment.enabled &&
        fragment.kind === 'status'
    )

    const picked = statusFragments[Math.floor(Math.random() * statusFragments.length)]

    if (!picked) return

    const now = Date.now()

    const todayStatus = {
      content: picked.text,
      zicardId: picked.id,
      drawnAt: now,
    }

    await db.zicardSessions.update(sessionId, {
      todayStatus,
      updatedAt: now,
    })

    set((state) => ({
      currentSession:
        state.currentSession?.id === sessionId
          ? {
              ...state.currentSession,
              todayStatus,
              updatedAt: now,
            }
          : state.currentSession,
      sessions: state.sessions.map((item) =>
        item.id === sessionId
          ? {
              ...item,
              todayStatus,
              updatedAt: now,
            }
          : item
      ),
    }))
  },

  exportSession: async (sessionId) => {
    const session = await db.zicardSessions.get(sessionId)

    if (!session) {
      throw new Error('会话不存在')
    }

    const [messages, libraries, fragments, diaries, traces, userNotes] =
      await Promise.all([
        db.zicardMessages.where('sessionId').equals(sessionId).toArray(),
        db.zicardLibraries.where('id').anyOf(session.libraryIds).toArray(),
        db.zicardFragments.where('libraryId').anyOf(session.libraryIds).toArray(),
        db.zicardDiaries.where('sessionId').equals(sessionId).toArray(),
        db.zicardTraces.where('sessionId').equals(sessionId).toArray(),
        db.zicardUserNotes.where('sessionId').equals(sessionId).toArray(),
      ])

    return {
      app: 'misisle-zicard',
      version: 1,
      exportedAt: Date.now(),
      type: 'session',
      data: {
        sessions: [session],
        messages,
        libraries,
        fragments,
        diaries,
        traces,
        userNotes,
      },
    }
  },
}))

