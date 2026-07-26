// src/lib/ai/provider.ts
import { db } from '@/lib/db'
import type { AIProvider } from '@/types'
import { generateId } from '@/lib/utils/id'

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
}

function normalizeModelsResponse(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []

  const record = data as Record<string, unknown>

  // OpenAI compatible: { data: [{ id: 'xxx' }] }
  if (Array.isArray(record.data)) {
    return record.data
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'id' in item) {
          return String((item as { id: unknown }).id)
        }
        if (item && typeof item === 'object' && 'name' in item) {
          return String((item as { name: unknown }).name)
        }
        return ''
      })
      .filter(Boolean)
  }

  // Some providers: { models: [...] }
  if (Array.isArray(record.models)) {
    return record.models
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'id' in item) {
          return String((item as { id: unknown }).id)
        }
        if (item && typeof item === 'object' && 'name' in item) {
          return String((item as { name: unknown }).name)
        }
        return ''
      })
      .filter(Boolean)
  }

  return []
}

export async function createProvider(
  data: Omit<AIProvider, 'id' | 'models' | 'createdAt' | 'updatedAt'>
): Promise<AIProvider> {
  const now = Date.now()
  const provider: AIProvider = {
    id: generateId(),
    ...data,
    baseUrl: normalizeBaseUrl(data.baseUrl),
    models: [],
    createdAt: now,
    updatedAt: now,
  }
  await db.aiProviders.add(provider)
  return provider
}

export async function updateProvider(
  id: string,
  data: Partial<AIProvider>
): Promise<void> {
  await db.aiProviders.update(id, {
    ...data,
    baseUrl: data.baseUrl ? normalizeBaseUrl(data.baseUrl) : data.baseUrl,
    updatedAt: Date.now(),
  })
}

export async function deleteProvider(id: string): Promise<void> {
  await db.aiProviders.delete(id)
}

export async function getAllProviders(): Promise<AIProvider[]> {
  return db.aiProviders.orderBy('createdAt').toArray()
}

export async function getProvider(id: string): Promise<AIProvider | undefined> {
  return db.aiProviders.get(id)
}

export async function fetchModels(provider: AIProvider): Promise<string[]> {
  const baseUrl = normalizeBaseUrl(provider.baseUrl)

  const paths = ['/models', '/model']
  let lastError: unknown = null

  for (const path of paths) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: provider.apiKey
          ? {
              Authorization: `Bearer ${provider.apiKey}`,
            }
          : undefined,
      })

      if (!response.ok) {
        lastError = new Error(`Failed to fetch models from ${path}: ${response.status}`)
        continue
      }

      const data = await response.json()
      const models = normalizeModelsResponse(data)

      await db.aiProviders.update(provider.id, {
        models,
        updatedAt: Date.now(),
      })

      return models
    } catch (error) {
      lastError = error
    }
  }

  console.error('Error fetching models:', lastError)
  throw lastError instanceof Error ? lastError : new Error('Failed to fetch models')
}

export async function testProviderConnection(provider: AIProvider): Promise<boolean> {
  const models = await fetchModels(provider)
  return models.length >= 0
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  provider: AIProvider
  model: string
  messages: ChatCompletionMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  onStream?: (chunk: string) => void
}

export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const {
    provider,
    model,
    messages,
    temperature = 0.7,
    maxTokens = 2000,
    stream = false,
    onStream,
  } = options

  const response = await fetch(`${normalizeBaseUrl(provider.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Chat completion failed: ${response.status} - ${error}`)
  }

  if (stream && onStream) {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              onStream(content)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

