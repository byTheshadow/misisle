// src/lib/db/index.ts
import Dexie, { Table } from 'dexie'
import type {
  AIProvider,
  UserIdentity,
  Character,
  Memory,
  Chat,
  ChatMessage,
  ZicardLibrary,
  ZicardFragment,
  ZicardMessage,
  ZicardUserNote,
  KnowledgeBase,
  KnowledgeEntry,
  GlobalSettings,
  WidgetConfig,
} from '@/types'

export class MisisleDB extends Dexie {
  // 表定义
  aiProviders!: Table<AIProvider>
  userIdentities!: Table<UserIdentity>
  characters!: Table<Character>
  memories!: Table<Memory>
  chats!: Table<Chat>
  chatMessages!: Table<ChatMessage>
  zicardLibraries!: Table<ZicardLibrary>
  zicardFragments!: Table<ZicardFragment>
  zicardMessages!: Table<ZicardMessage>
  zicardUserNotes!: Table<ZicardUserNote>
  knowledgeBases!: Table<KnowledgeBase>
  knowledgeEntries!: Table<KnowledgeEntry>
  settings!: Table<GlobalSettings & { id: string }>
  widgets!: Table<WidgetConfig>

  constructor() {
    super('MisisleDB')
    
    this.version(1).stores({
      // AI 配置
      aiProviders: 'id, name, createdAt',
      
      // 用户身份
      userIdentities: 'id, name, isRealSelf, createdAt',
      
      // 角色
      characters: 'id, name, createdAt, updatedAt',
      
      // 记忆（按角色、聊天、类型索引）
      memories: 'id, characterId, chatId, type, userIdentityId, importance, createdAt',
      
      // 聊天
      chats: 'id, characterId, userIdentityId, mode, lastMessageAt, createdAt',
      chatMessages: 'id, chatId, role, createdAt',
      
      // 字卡
      zicardLibraries: 'id, characterId, createdAt',
      zicardFragments: 'id, libraryId, position, createdAt',
      zicardMessages: 'id, libraryId, role, createdAt',
      zicardUserNotes: 'id, libraryId, createdAt',
      
      // 知识库
      knowledgeBases: 'id, name, createdAt',
      knowledgeEntries: 'id, knowledgeBaseId, createdAt',
      
      // 设置（单条记录）
      settings: 'id',
      
      // Widget 配置
      widgets: 'id, type, visible',
    })
  }
}

export const db = new MisisleDB()

// 初始化默认设置
export async function initDefaultSettings(): Promise<void> {
  const existing = await db.settings.get('global')
  if (!existing) {
    await db.settings.put({
      id: 'global',
      theme: {
        colorScheme: 'dark',
        wallpaper: '',
        customCSS: '',
        cssVariables: {},
      },
      bubble: {
        character: {
          bgColor: 'rgba(255, 255, 255, 0.1)',
          textColor: '#f5f5f5',
          borderRadius: '18px 18px 18px 4px',
          fontSize: '15px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        user: {
          bgColor: 'rgba(255, 255, 255, 0.2)',
          textColor: '#f5f5f5',
          borderRadius: '18px 18px 4px 18px',
          fontSize: '15px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        showTimestamp: 'below',
        showReadStatus: true,
        timestampFormat: '24h',
      },
      notifications: {
        enabled: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
        maxPerDay: 20,
        modules: {
          chat: true,
          zicard: true,
          todo: true,
          calendar: true,
          games: true,
        },
      },
      memory: {
        autoExtractThreshold: 30,
        maxTokensInPrompt: 4000,
      },
      sync: {
        githubEnabled: false,
        githubRepo: '',
        githubToken: '',
        autoSync: false,
        syncIntervalMinutes: 30,
      },
      zicard: {
        enableDailyRitual: true,
        ritualDurationSeconds: 5,
      },
    })
  }
}
