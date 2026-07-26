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
  ZicardSession,
  ZicardTrace,
  ZicardDiaryEntry,
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

  // 字卡系统
  zicardLibraries!: Table<ZicardLibrary>
  zicardFragments!: Table<ZicardFragment>
  zicardSessions!: Table<ZicardSession>
  zicardMessages!: Table<ZicardMessage>
  zicardUserNotes!: Table<ZicardUserNote>
  zicardTraces!: Table<ZicardTrace>
  zicardDiaries!: Table<ZicardDiaryEntry>

  knowledgeBases!: Table<KnowledgeBase>
  knowledgeEntries!: Table<KnowledgeEntry>
  settings!: Table<GlobalSettings & { id: string }>
  widgets!: Table<WidgetConfig>

  constructor() {
    super('MisisleDB')

    this.version(2).stores({
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
      zicardLibraries: 'id, characterId, scope, createdAt, updatedAt',
      zicardFragments: 'id, libraryId, kind, position, category, enabled, createdAt, updatedAt',
      zicardSessions:
        'id, characterSource, characterId, userIdentityId, lastMessageAt, createdAt, updatedAt',
      zicardMessages:
        'id, sessionId, sender, type, responseGroupId, deletedAt, createdAt, updatedAt',
      zicardUserNotes: 'id, sessionId, libraryId, createdAt',
      zicardTraces: 'id, sessionId, source, pinned, canEcho, createdAt, updatedAt',
      zicardDiaries: 'id, sessionId, source, createdAt, updatedAt',

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

export function createDefaultSettings(): GlobalSettings {
  return {
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
    ai: {
      defaultChatProviderId: '',
      defaultChatModelId: '',
      defaultBackgroundProviderId: '',
      defaultBackgroundModelId: '',
    },
    backgroundTriggers: {
      enabled: false,
      intervalMinutes: 60,
      useTodoTime: false,
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
    home: {
      profile: {
        displayName: '我的主页',
        signature: '今天也在雾里慢慢生活。',
        avatarUrl: '',
        backgroundUrl: '',
      },
      together: {
        title: '在一起的第',
        startDate: '2024-01-01',
        leftAvatarUrl: '',
        rightAvatarUrl: '',
        note: '',
      },
      images: {
        largeImageUrl: '',
        smallImageUrl: '',
        largeTitle: '大图',
        smallTitle: '小图',
      },
      messageBoard: {
        mode: 'ai',
        selectedCharacterId: null,
        lastSeenAt: Date.now(),
      },
    },
  }
}

// 初始化默认设置
export async function initDefaultSettings(): Promise<void> {
  const existing = await db.settings.get('global')

  if (!existing) {
    await db.settings.put({
      id: 'global',
      ...createDefaultSettings(),
    })
    return
  }

  const defaults = createDefaultSettings()

  await db.settings.put({
    ...existing,
    theme: {
      ...defaults.theme,
      ...existing.theme,
      cssVariables: {
        ...defaults.theme.cssVariables,
        ...(existing.theme?.cssVariables ?? {}),
      },
    },
    bubble: {
      ...defaults.bubble,
      ...existing.bubble,
      character: {
        ...defaults.bubble.character,
        ...(existing.bubble?.character ?? {}),
      },
      user: {
        ...defaults.bubble.user,
        ...(existing.bubble?.user ?? {}),
      },
    },
    ai: {
      ...defaults.ai,
      ...(existing.ai ?? {}),
    },
    backgroundTriggers: {
      ...defaults.backgroundTriggers,
      ...(existing.backgroundTriggers ?? {}),
    },
    notifications: {
      ...defaults.notifications,
      ...existing.notifications,
      modules: {
        ...defaults.notifications.modules,
        ...(existing.notifications?.modules ?? {}),
      },
    },
    memory: {
      ...defaults.memory,
      ...(existing.memory ?? {}),
    },
    sync: {
      ...defaults.sync,
      ...(existing.sync ?? {}),
    },
    zicard: {
      ...defaults.zicard,
      ...(existing.zicard ?? {}),
    },
    home: {
      ...defaults.home,
      ...(existing.home ?? {}),
      profile: {
        ...defaults.home.profile,
        ...(existing.home?.profile ?? {}),
      },
      together: {
        ...defaults.home.together,
        ...(existing.home?.together ?? {}),
      },
      images: {
        ...defaults.home.images,
        ...(existing.home?.images ?? {}),
      },
      messageBoard: {
        ...defaults.home.messageBoard,
        ...(existing.home?.messageBoard ?? {}),
        selectedCharacterId:
          existing.home?.messageBoard?.selectedCharacterId ??
          ((existing.home?.messageBoard as any)?.selectedCharacterIds?.[0] ?? null),
      },
    },
  })
}
