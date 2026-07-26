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
  NovelRPConversation,
  NovelRPMessage,
  CharacterDiary,
  DivinationReading,
  TodoItem,
  VocabularyItem,
  VocabularySettings,
  HomeProfileCard,
  HomeTogetherWidget,
  HomeImageWidget,
  HomeMessageBoardConfig,
  HomeMessageBoardItem,
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

  novelRPConversations!: Table<NovelRPConversation>
  novelRPMessages!: Table<NovelRPMessage>
  characterDiaries!: Table<CharacterDiary>
  divinationReadings!: Table<DivinationReading>
  todoItems!: Table<TodoItem>
  vocabularyItems!: Table<VocabularyItem>
  vocabularySettings!: Table<VocabularySettings>
  homeProfileCards!: Table<HomeProfileCard>
  homeTogetherWidgets!: Table<HomeTogetherWidget>
  homeImageWidgets!: Table<HomeImageWidget>
  homeMessageBoardConfigs!: Table<HomeMessageBoardConfig>
  homeMessageBoardItems!: Table<HomeMessageBoardItem>

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

      // 小说 RP
      novelRPConversations:
        'id, userIdentityId, lastMessageAt, createdAt, updatedAt',
      novelRPMessages: 'id, conversationId, speakerCharacterId, createdAt',

      // 角色日记
      characterDiaries: 'id, characterId, date, createdAt, updatedAt',

      // 塔罗 / 雷诺曼
      divinationReadings: 'id, deckType, spreadId, createdAt, updatedAt',

      // TodoList
      todoItems:
        'id, completed, dueAt, remindAt, source, characterId, createdAt, updatedAt',

      // 背单词
      vocabularyItems: 'id, word, language, familiarity, createdAt, updatedAt',
      vocabularySettings: 'id, updatedAt',

      // 首页美化组件
      homeProfileCards: 'id, updatedAt',
      homeTogetherWidgets: 'id, updatedAt',
      homeImageWidgets: 'id, variant, updatedAt',
      homeMessageBoardConfigs: 'id, mode, updatedAt',
      homeMessageBoardItems: 'id, characterId, source, createdAt',
    })
  }
}

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
        note: '仅作为首页美化组件，不绑定真实关系。',
      },
      images: {
        largeImageUrl: '',
        smallImageUrl: '',
        largeTitle: '大图组件',
        smallTitle: '小图组件',
      },
      messageBoard: {
        mode: 'ai',
        selectedCharacterIds: [],
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
      ...existing.memory,
    },
    sync: {
      ...defaults.sync,
      ...existing.sync,
    },
    zicard: {
      ...defaults.zicard,
      ...existing.zicard,
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
      },
    },
  })

  }

  // 兼容旧数据：已有 settings 时补齐新增字段，避免 settings.ai 未定义报错
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
      ...existing.memory,
    },
    sync: {
      ...defaults.sync,
      ...existing.sync,
    },
    zicard: {
      ...defaults.zicard,
      ...existing.zicard,
    },
  })
}

