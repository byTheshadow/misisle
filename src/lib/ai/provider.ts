// src/lib/ai/provider.ts
import { db } from '@/lib/db'
import type { AIProvider } from '@/types'
import { generateId } from '@/lib/utils/id'

export async function createProvider(
  data: Omit<AIProvider, 'id' | 'models' | 'createdAt' | 'updatedAt'>
): Promise<AIProvider> {
  const now = Date.now()
  const provider: AIProvider = {
    id: generateId(),
    ...data,
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
  try {
    const response = await fetch(`${provider.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`)
    }

    const data = await response.json()
    const models = data.data?.map((m: { id: string }) => m.id) || []

    // 更新缓存
    await db.aiProviders.update(provider.id, {
      models,
      updatedAt: Date.now(),
    })

    return models
  } catch (error) {
    console.error('Error fetching models:', error)
    throw error
  }
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
  const { provider, model, messages, temperature = 0.7, maxTokens = 2000, stream = false, onStream } = options

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
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

    // src/lib/ai/provider.ts（续）

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

