// src/types/index.ts

// ============================================
// AI Provider 配置
// ============================================
export interface AIProvider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  models: string[]
  createdAt: number
  updatedAt: number
}

// ============================================
// User 身份
// ============================================
export interface UserIdentity {
  id: string
  name: string
  avatar: string
  description: string
  isRealSelf: boolean
  createdAt: number
  updatedAt: number
}

// ============================================
// 角色卡
// ============================================
export interface Character {
  id: string
  name: string
  avatar: string
  description: string
  createdAt: number
  updatedAt: number

  // AI 配置
  ai: {
    providerId: string
    modelId: string
    systemPrompt: string
    personality: string
    exampleDialogs: ExampleDialog[]
    temperature: number
    maxTokens: number
  }

  // 气泡样式覆盖（null 表示使用全局默认）
  bubbleStyle: BubbleStyle | null

  // 关联数据
  knowledgeBaseIds: string[]
  relationship: string
}

export interface ExampleDialog {
  role: 'user' | 'assistant'
  content: string
}

// ============================================
// 气泡样式
// ============================================
export interface BubbleStyle {
  character: {
    bgColor: string
    textColor: string
    borderRadius: string
    fontSize: string
    fontFamily: string
  }
  user: {
    bgColor: string
    textColor: string
    borderRadius: string
    fontSize: string
    fontFamily: string
  }
  showTimestamp: 'inline' | 'below' | 'hover' | 'none'
  showReadStatus: boolean
  timestampFormat: '12h' | '24h'
}

// ============================================
// 记忆系统
// ============================================
export interface Memory {
  id: string
  characterId: string
  chatId: string | null
  type: 'rp' | 'daily' | 'zicard'
  userIdentityId: string | null
  category: 'fact' | 'emotion' | 'event' | 'preference'
  content: string
  source: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  isUserEdited: boolean
  createdAt: number
  updatedAt: number
}

// ============================================
// 聊天系统
// ============================================
export interface Chat {
  id: string
  characterId: string
  userIdentityId: string | null
  mode: 'rp' | 'daily'
  title: string
  lastMessage: string
  lastMessageAt: number
  unreadCount: number
  createdAt: number
  updatedAt: number
}

export interface ChatMessage {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isRead: boolean
  createdAt: number
}
// ============================================
// 字卡系统
// ============================================

export type ZicardConnectionMode = 'deep_random' | 'keyword_random'

export type ZicardCharacterSource = 'global_character' | 'zicard_local'

export type ZicardLibraryScope = 'global' | 'character_bound'

export type ZicardKind =
  | 'text'
  | 'image'
  | 'voice'
  | 'status'
  | 'diary'
  | 'system'

export type ZicardMessageSender = 'user' | 'character' | 'system'

export type ZicardMessageType =
  | 'text'
  | 'image-card'
  | 'voice-card'
  | 'zicard-request'
  | 'status'
  | 'system'

export type ZicardTraceSource =
  | 'user_message'
  | 'past_event'
  | 'manual_note'

export type ZicardDiarySource =
  | 'manual'
  | 'message'
  | 'zicard'
  | 'trace'
  | 'random'

export interface ZicardLibrary {
  id: string

  /**
   * null = 通用字卡库，不跟角色删除
   * string = 绑定到某个全局角色，角色删除时可级联删除
   */
  characterId: string | null

  name: string
  description: string

  scope: ZicardLibraryScope

  createdAt: number
  updatedAt: number

  settings: {
    enableKeywordTrigger: boolean
    autoWeather: boolean
    manualWeather: string

    replyDelayMin: number
    replyDelayMax: number

    allowMultiBubble: boolean
    allowCombinedBubble: boolean
  }
}

export interface ZicardFragment {
  id: string
  libraryId: string

  kind: ZicardKind

  /**
   * 用于可选拼接。
   * single/any 更适合现在的“单张字卡 / 多张气泡”模式。
   */
  position: 'single' | 'opening' | 'middle' | 'ending' | 'any'

  text: string

  /**
   * 图片式字卡：SVG 占位图标 + 翻转文字
   */
  imageIcon?: 'moon' | 'rain' | 'cloud' | 'letter' | 'window' | 'flower' | 'star'
  imageBackText?: string

  /**
   * 语音式字卡：假的语音气泡 + 文本转写
   */
  voiceDuration?: number
  voiceTranscript?: string

  category: string
  tags: string[]
  weight: number
  enabled: boolean

  conditions: {
    timeSlots: string[]
    weather: string[]
    dates: string[]
    keywords: string[]
  }

  createdAt: number
  updatedAt: number
}

export interface ZicardSession {
  id: string

  characterSource: ZicardCharacterSource

  /**
   * characterSource = global_character 时使用
   */
  characterId: string | null

  /**
   * characterSource = zicard_local 时使用
   */
  localCharacter: {
    name: string
    avatar: string
    personality: string
    description: string
  } | null

  userIdentityId: string | null

  title: string
  avatar: string

  libraryIds: string[]

  mode: ZicardConnectionMode

  typingIndicatorText: string

  replyDelay: {
    type: 'instant' | 'fixed' | 'random'
    fixedMinutes: number
    minMinutes: number
    maxMinutes: number
  }

  theme: {
    background: string
    userBubble: string
    characterBubble: string
    textColor: string
  }

  todayStatus: {
    content: string
    zicardId: string | null
    drawnAt: number
  } | null

  lastMessage: string
  lastMessageAt: number
  unreadCount: number

  createdAt: number
  updatedAt: number
}

export interface ZicardMessage {
  id: string
  sessionId: string

  sender: ZicardMessageSender
  type: ZicardMessageType

  content: string

  zicardIds: string[]

  /**
   * 用于“部分合并 / 多条气泡”时归属同一次回应
   */
  responseGroupId: string | null

  /**
   * 消息引用
   */
  quote: {
    messageId: string
    sender: ZicardMessageSender
    content: string
  } | null

  imageIcon?: string
  imageBackText?: string

  voiceDuration?: number
  voiceTranscript?: string

  requestAction?: {
    kind: 'save_user_message_as_zicard'
    sourceMessageId: string
    status: 'pending' | 'accepted' | 'rejected'
  }

  isRead: boolean

  /**
   * 软删除，便于导出/恢复。
   */
  deletedAt: number | null

  createdAt: number
  updatedAt: number
}

export interface ZicardTrace {
  id: string
  sessionId: string

  source: ZicardTraceSource
  sourceMessageId: string | null

  content: string
  excerpt: string

  tags: string[]

  pinned: boolean
  canEcho: boolean

  createdAt: number
  updatedAt: number
}

export interface ZicardDiaryEntry {
  id: string
  sessionId: string

  title: string
  content: string

  source: ZicardDiarySource
  sourceId: string | null

  mood: string
  tags: string[]

  createdAt: number
  updatedAt: number
}

export interface ZicardUserNote {
  id: string
  sessionId: string
  libraryId: string | null

  content: string
  keywords: string[]

  createdAt: number
  updatedAt: number
}

export interface ZicardExportPackage {
  app: 'misisle-zicard'
  version: number
  exportedAt: number

  type: 'session' | 'library' | 'all'

  data: {
    sessions?: ZicardSession[]
    messages?: ZicardMessage[]
    libraries?: ZicardLibrary[]
    fragments?: ZicardFragment[]
    diaries?: ZicardDiaryEntry[]
    traces?: ZicardTrace[]
    userNotes?: ZicardUserNote[]
  }
}


// ============================================
// 知识库
// ============================================
export interface KnowledgeBase {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

export interface KnowledgeEntry {
  id: string
  knowledgeBaseId: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

// ============================================
// 全局设置
// ============================================

export interface GlobalSettings {
  theme: {
    colorScheme: 'dark' | 'light' | 'custom'
    wallpaper: string
    customCSS: string
    cssVariables: Record<string, string>
  }

  bubble: BubbleStyle

  ai: {
    defaultChatProviderId: string
    defaultChatModelId: string
    defaultBackgroundProviderId: string
    defaultBackgroundModelId: string
  }

  backgroundTriggers: {
    enabled: boolean
    intervalMinutes: number
    useTodoTime: boolean
  }

  notifications: {
    enabled: boolean
    quietHoursStart: string
    quietHoursEnd: string
    maxPerDay: number
    modules: {
      chat: boolean
      zicard: boolean
      todo: boolean
      calendar: boolean
      games: boolean
    }
  }

  memory: {
    autoExtractThreshold: number
    maxTokensInPrompt: number
  }

  sync: {
    githubEnabled: boolean
    githubRepo: string
    githubToken: string
    autoSync: boolean
    syncIntervalMinutes: number
  }

  zicard: {
    enableDailyRitual: boolean
    ritualDurationSeconds: number
  }

  home: HomeSettings
}


// ============================================
// Widget 配置（主页）
// ============================================
export interface WidgetConfig {
  id: string
  type: 'app-grid' | 'message-board' | 'todo' | 'unread' | 'calendar' | 'moments'
  position: { x: number; y: number }
  size: { width: number; height: number }
  visible: boolean
}

// ============================================
// 小说 RP
// ============================================
export interface NovelRPConversation {
  id: string
  title: string

  // 引用角色库角色，不在 Novel RP 内复制创建角色
  characterIds: string[]

  // RP 模式下可绑定 User 身份
  userIdentityId: string | null

  synopsis: string
  currentScene: string
  writingStyle: string

  lastMessage: string
  lastMessageAt: number

  createdAt: number
  updatedAt: number
}

export interface NovelRPMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  speakerCharacterId: string | null
  content: string
  createdAt: number
}

// ============================================
// 角色日记
// ============================================
export interface CharacterDiary {
  id: string
  characterId: string
  date: string

  structured: {
    learned: string[]
    feelings: string
    memorable: string
  }

  content: string

  isLocked: boolean
  password: string

  createdAt: number
  updatedAt: number
}

// ============================================
// 塔罗 / 雷诺曼
// ============================================
export type DivinationDeckType = 'tarot' | 'lenormand'

export interface DivinationReading {
  id: string
  deckType: DivinationDeckType
  spreadId: string
  question: string

  cards: DivinationReadingCard[]

  fallbackInterpretation: string
  aiInterpretation: string | null

  createdAt: number
  updatedAt: number
}

export interface DivinationReadingCard {
  cardId: string
  name: string
  positionName: string
  orientation: 'upright' | 'reversed' | 'none'
  meaning: string
}

// ============================================
// TodoList
// ============================================
export interface TodoItem {
  id: string
  title: string
  description: string
  completed: boolean

  dueAt: number | null
  remindAt: number | null

  source: 'manual' | 'character' | 'system'
  characterId: string | null

  createdAt: number
  updatedAt: number
}

// ============================================
// 背单词
// ============================================
export interface VocabularyItem {
  id: string
  word: string
  language: string
  translation: string
  phonetic: string
  examples: string[]
  notes: string

  familiarity: 'new' | 'learning' | 'familiar' | 'mastered'

  createdAt: number
  updatedAt: number
}

export interface VocabularySettings {
  id: string
  enableCharacterReminder: boolean
  reminderCharacterIds: string[]
  targetLanguages: string[]
  dailyGoal: number
  updatedAt: number
}

// ============================================
// 首页美化组件
// ============================================
export interface HomeProfileCard {
  id: string
  avatarUrl: string
  backgroundUrl: string
  displayName: string
  signature: string
  updatedAt: number
}

export interface HomeTogetherWidget {
  id: string
  title: string
  leftAvatarUrl: string
  rightAvatarUrl: string
  startDate: string
  note: string
  updatedAt: number
}

export interface HomeImageWidget {
  id: string
  title: string
  imageUrl: string
  variant: 'large' | 'small'
  updatedAt: number
}

export interface HomeMessageBoardConfig {
  id: string
  mode: 'ai' | 'zicard'
  selectedCharacterIds: string[]
  lastSeenAt: number
  updatedAt: number
}

export interface HomeMessageBoardItem {
  id: string
  characterId: string | null
  source: 'ai' | 'zicard'
  content: string
  createdAt: number
}
// ============================================
// 首页个性化设置
// ============================================
export interface HomeSettings {
  profile: HomeProfileSettings
  together: HomeTogetherSettings
  images: HomeImageSettings
  messageBoard: HomeMessageBoardSettings
}

export interface HomeProfileSettings {
  displayName: string
  signature: string
  avatarUrl: string
  backgroundUrl: string
}

export interface HomeTogetherSettings {
  title: string
  startDate: string
  leftAvatarUrl: string
  rightAvatarUrl: string
  note: string
}

export interface HomeImageSettings {
  largeImageUrl: string
  smallImageUrl: string
  largeTitle: string
  smallTitle: string
}

export interface HomeMessageBoardSettings {
  mode: 'ai' | 'zicard'

  // 从现有角色库中单选，不在留言板内创建角色
  selectedCharacterId: string | null

  // 用于后续根据离开时长生成/抽取留言
  lastSeenAt: number
}
