// src/lib/stores/chats.ts
import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Chat, ChatMessage } from '@/types'
import { generateId } from '@/lib/utils/id'

interface ChatsState {
  chats: Chat[]
  currentChat: Chat | null
  currentMessages: ChatMessage[]
  isLoaded: boolean

  loadChats: () => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  createChat: (data: Omit<Chat, 'id' | 'lastMessage' | 'lastMessageAt' | 'unreadCount' | 'createdAt' | 'updatedAt'>) => Promise<Chat>
  updateChat: (id: string, data: Partial<Chat>) => Promise<void>
  deleteChat: (id: string) => Promise<void>
  setCurrentChat: (chat: Chat | null) => void
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'chatId' | 'createdAt'>) => Promise<ChatMessage>
  markAsRead: (chatId: string) => Promise<void>
  getMessageCount: (chatId: string) => Promise<number>
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: [],
  currentChat: null,
  currentMessages: [],
  isLoaded: false,

  loadChats: async () => {
    const chats = await db.chats.orderBy('lastMessageAt').reverse().toArray()
    set({ chats, isLoaded: true })
  },

  loadChatMessages: async (chatId) => {
    const messages = await db.chatMessages
      .where('chatId')
      .equals(chatId)
      .sortBy('createdAt')
    set({ currentMessages: messages })
  },

  createChat: async (data) => {
    const now = Date.now()
    const chat: Chat = {
      id: generateId(),
      ...data,
      lastMessage: '',
      lastMessageAt: now,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    await db.chats.add(chat)
    set((state) => ({ chats: [chat, ...state.chats] }))
    return chat
  },

  updateChat: async (id, data) => {
    const updatedAt = Date.now()
    await db.chats.update(id, { ...data, updatedAt })
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt } : c
      ),
      currentChat: state.currentChat?.id === id
        ? { ...state.currentChat, ...data, updatedAt }
        : state.currentChat,
    }))
  },

  deleteChat: async (id) => {
    await db.chats.delete(id)
    await db.chatMessages.where('chatId').equals(id).delete()
    await db.memories.where('chatId').equals(id).delete()
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== id),
      currentChat: state.currentChat?.id === id ? null : state.currentChat,
      currentMessages: state.currentChat?.id === id ? [] : state.currentMessages,
    }))
  },

  setCurrentChat: (chat) => {
    set({ currentChat: chat })
    if (chat) {
      get().loadChatMessages(chat.id)
    } else {
      set({ currentMessages: [] })
    }
  },

  addMessage: async (chatId, messageData) => {
    const now = Date.now()
    const message: ChatMessage = {
      id: generateId(),
      chatId,
      ...messageData,
      createdAt: now,
    }
    await db.chatMessages.add(message)

    // 更新聊天列表
    const lastMessage = messageData.content.slice(0, 50)
    await db.chats.update(chatId, {
      lastMessage,
      lastMessageAt: now,
      unreadCount: messageData.role === 'assistant' ? 1 : 0,
      updatedAt: now,
    })

    set((state) => ({
      currentMessages: [...state.currentMessages, message],
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage,
              lastMessageAt: now,
              unreadCount: messageData.role === 'assistant' ? c.unreadCount + 1 : c.unreadCount,
              updatedAt: now,
            }
          : c
      ),
    }))

    return message
  },

  markAsRead: async (chatId) => {
    await db.chats.update(chatId, { unreadCount: 0 })
    await db.chatMessages
      .where('chatId')
      .equals(chatId)
      .modify({ isRead: true })
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ),
      currentMessages: state.currentMessages.map((m) => ({ ...m, isRead: true })),
    }))
  },

  getMessageCount: async (chatId) => {
    return db.chatMessages.where('chatId').equals(chatId).count()
  },
}))
