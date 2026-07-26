import type {
  ZicardFragment,
  ZicardMessage,
  ZicardMessageType,
} from '@/types'
import { generateId } from '@/lib/utils/id'

export interface ZicardRandomResult {
  messages: Omit<ZicardMessage, 'id' | 'createdAt' | 'updatedAt'>[]
  fragmentIds: string[]
}

function weightedPick<T extends { weight: number }>(items: T[]): T | null {
  if (items.length === 0) return null

  const total = items.reduce((sum, item) => sum + Math.max(1, item.weight || 1), 0)
  let random = Math.random() * total

  for (const item of items) {
    random -= Math.max(1, item.weight || 1)
    if (random <= 0) return item
  }

  return items[items.length - 1]
}

function pickManyWeighted<T extends { id: string; weight: number }>(
  items: T[],
  count: number
): T[] {
  const pool = [...items]
  const result: T[] = []

  for (let i = 0; i < count; i += 1) {
    if (pool.length === 0) break

    const picked = weightedPick(pool)
    if (!picked) break

    result.push(picked)

    const index = pool.findIndex((item) => item.id === picked.id)
    if (index >= 0) pool.splice(index, 1)
  }

  return result
}

function getRandomReplyCount(): number {
  const random = Math.random()

  if (random < 0.6) return 1
  if (random < 0.9) return 2
  return 3
}

function getDisplayMode(): 'separate' | 'combined' | 'mixed' {
  const random = Math.random()

  if (random < 0.7) return 'separate'
  if (random < 0.9) return 'combined'
  return 'mixed'
}

function mapKindToMessageType(kind: ZicardFragment['kind']): ZicardMessageType {
  if (kind === 'image') return 'image-card'
  if (kind === 'voice') return 'voice-card'
  if (kind === 'status') return 'status'
  if (kind === 'system') return 'system'
  return 'text'
}

export function generateDeepRandomZicardMessages(params: {
  sessionId: string
  fragments: ZicardFragment[]
}): ZicardRandomResult {
  const { sessionId } = params

  const enabledFragments = params.fragments.filter(
    (fragment) => fragment.enabled && fragment.kind !== 'status' && fragment.kind !== 'diary'
  )

  if (enabledFragments.length === 0) {
    return {
      fragmentIds: [],
      messages: [
        {
          sessionId,
          sender: 'system',
          type: 'system',
          content: '还没有可用字卡。请先去字卡库添加一些文字。',
          zicardIds: [],
          responseGroupId: null,
          quote: null,
          isRead: true,
          deletedAt: null,
        },
      ],
    }
  }

  const count = Math.min(getRandomReplyCount(), enabledFragments.length)
  const picked = pickManyWeighted(enabledFragments, count)
  const displayMode = getDisplayMode()
  const responseGroupId = generateId()

  if (displayMode === 'combined' && picked.length > 1) {
    return {
      fragmentIds: picked.map((fragment) => fragment.id),
      messages: [
        {
          sessionId,
          sender: 'character',
          type: 'text',
          content: picked.map((fragment) => fragment.text).join('\n'),
          zicardIds: picked.map((fragment) => fragment.id),
          responseGroupId,
          quote: null,
          isRead: true,
          deletedAt: null,
        },
      ],
    }
  }

  if (displayMode === 'mixed' && picked.length > 2) {
    const first = picked[0]
    const rest = picked.slice(1)

    return {
      fragmentIds: picked.map((fragment) => fragment.id),
      messages: [
        {
          sessionId,
          sender: 'character',
          type: mapKindToMessageType(first.kind),
          content: first.text,
          zicardIds: [first.id],
          responseGroupId,
          quote: null,
          imageIcon: first.imageIcon,
          imageBackText: first.imageBackText,
          voiceDuration: first.voiceDuration,
          voiceTranscript: first.voiceTranscript,
          isRead: true,
          deletedAt: null,
        },
        {
          sessionId,
          sender: 'character',
          type: 'text',
          content: rest.map((fragment) => fragment.text).join('\n'),
          zicardIds: rest.map((fragment) => fragment.id),
          responseGroupId,
          quote: null,
          isRead: true,
          deletedAt: null,
        },
      ],
    }
  }

  return {
    fragmentIds: picked.map((fragment) => fragment.id),
    messages: picked.map((fragment) => ({
      sessionId,
      sender: 'character',
      type: mapKindToMessageType(fragment.kind),
      content: fragment.text,
      zicardIds: [fragment.id],
      responseGroupId,
      quote: null,
      imageIcon: fragment.imageIcon,
      imageBackText: fragment.imageBackText,
      voiceDuration: fragment.voiceDuration,
      voiceTranscript: fragment.voiceTranscript,
      isRead: true,
      deletedAt: null,
    })),
  }
}

export function shouldRandomlyAskToSaveMessage(params: {
  userContent: string
  lastAskedAt: number | null
  now: number
}): boolean {
  const { userContent, lastAskedAt, now } = params

  if (userContent.trim().length < 6) return false

  if (lastAskedAt && now - lastAskedAt < 10 * 60 * 1000) {
    return false
  }

  return Math.random() < 0.15
}
