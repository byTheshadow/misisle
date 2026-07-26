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
export interface ZicardLibrary {
  id: string
  characterId: string
  name: string
  createdAt: number
  updatedAt: number

  settings: {
    enableKeywordTrigger: boolean
    autoWeather: boolean
    manualWeather: string
    replyDelayMin: number
    replyDelayMax: number
  }
}

export interface ZicardFragment {
  id: string
  libraryId: string
  position: 'opening' | 'middle' | 'ending'
  text: string
  tags: string[]
  weight: number
  conditions: {
    timeSlots: string[]
    weather: string[]
    dates: string[]
    keywords: string[]
  }
  createdAt: number
  updatedAt: number
}

export interface ZicardMessage {
  id: string
  libraryId: string
  role: 'user' | 'zicard'
  content: string
  fragmentIds: string[]
  createdAt: number
}

export interface ZicardUserNote {
  id: string
  libraryId: string
  content: string
  keywords: string[]
  createdAt: number
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

