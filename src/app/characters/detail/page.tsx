'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCharactersStore } from '@/lib/stores/characters'
import { useProvidersStore } from '@/lib/stores/providers'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

export default function CharacterDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const characterId = searchParams.get('id')

  const {
    characters,
    isLoaded: charactersLoaded,
    loadCharacters,
    updateCharacter,
    deleteCharacter,
  } = useCharactersStore()

  const {
    providers,
    isLoaded: providersLoaded,
    loadProviders,
    fetchModels,
  } = useProvidersStore()

  const [isInitializing, setIsInitializing] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isFetchingModels, setIsFetchingModels] = useState(false)

  const character = useMemo(() => {
    if (!characterId) return undefined

    return characters.find((item) => item.id === characterId)
  }, [characterId, characters])

  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    description: '',
    relationship: '',
    providerId: '',
    modelId: '',
    systemPrompt: '',
    personality: '',
    temperature: 0.7,
    maxTokens: 2000,
  })

  useEffect(() => {
    if (!charactersLoaded) {
      loadCharacters()
    }
  }, [charactersLoaded, loadCharacters])

  useEffect(() => {
    if (!providersLoaded) {
      loadProviders()
    }
  }, [providersLoaded, loadProviders])

  useEffect(() => {
    if (!charactersLoaded) return

    if (!character) {
      setIsInitializing(false)
      return
    }

    setFormData({
      name: character.name,
      avatar: character.avatar,
      description: character.description,
      relationship: character.relationship,
      providerId: character.ai.providerId,
      modelId: character.ai.modelId,
      systemPrompt: character.ai.systemPrompt,
      personality: character.ai.personality,
      temperature: character.ai.temperature,
      maxTokens: character.ai.maxTokens,
    })

    setIsInitializing(false)
  }, [charactersLoaded, character])

  const selectedProvider = providers.find(
    (provider) => provider.id === formData.providerId
  )

  const handleFetchModels = async () => {
    if (!formData.providerId) return

    setIsFetchingModels(true)

    try {
      const models = await fetchModels(formData.providerId)

      if (models.length === 0) {
        alert('接口连接正常，但没有获取到可用模型。请确认该接口是否支持 /models 或 /model。')
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      alert('获取模型失败，请检查设置页中的 Base URL、API Key 和接口服务状态。')
    } finally {
      setIsFetchingModels(false)
    }
  }

  const handleSave = async () => {
  if (!formData.name.trim()) return

  const character = await createCharacter({
    name: formData.name.trim(),
    avatar: formData.avatar.trim(),
    description: formData.description.trim(),
    relationship: formData.relationship.trim(),
    ai: {
      providerId: formData.providerId,
      modelId: formData.modelId,
      systemPrompt: formData.systemPrompt,
      personality: formData.personality,
      exampleDialogs: [],
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
    },
    bubbleStyle: null,
    knowledgeBaseIds: [],
  })

  router.push(`/characters/detail?id=${character.id}`)
}


  const handleDelete = async () => {
    if (!character) return

    const confirmed = confirm(
      `确定要删除角色「${character.name}」吗？关联的聊天、记忆和字卡库也会被删除。`
    )

    if (!confirmed) return

    await deleteCharacter(character.id)
    router.push('/characters')
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader title="编辑角色" backHref="/characters" />
        <main className="flex-1 p-4">
          <Card>
            <p className="py-8 text-center text-mist-text-secondary">
              正在加载角色...
            </p>
          </Card>
        </main>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader title="角色不存在" backHref="/characters" />
        <main className="flex-1 p-4">
          <Card>
            <p className="py-8 text-center text-mist-text-secondary">
              未找到这个角色。它可能已经被删除，或链接中的角色 ID 无效。
            </p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="编辑角色"
        backHref="/characters"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleDelete}>
              删除
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || isSaving}
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 space-y-4">
        <Card>
          <h3 className="mb-4 text-sm font-medium text-mist-text">
            基础信息
          </h3>

          <div className="space-y-4">
            <Input
              label="名称"
              placeholder="角色名称"
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
            />

            <Input
              label="头像 URL"
              placeholder="https://..."
              value={formData.avatar}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  avatar: event.target.value,
                })
              }
            />

            <Textarea
              label="描述"
              placeholder="角色的简短描述..."
              rows={3}
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
            />

            <Input
              label="与你的关系"
              placeholder="例如：恋人、朋友、同事..."
              value={formData.relationship}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  relationship: event.target.value,
                })
              }
            />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-mist-text">AI 配置</h3>
              <p className="mt-1 text-xs text-mist-text-secondary">
                角色可单独覆盖设置页的默认聊天模型。
              </p>
            </div>

            {formData.providerId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFetchModels}
                disabled={isFetchingModels}
              >
                {isFetchingModels ? '获取中...' : '刷新模型'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Select
              label="AI 接口"
              value={formData.providerId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  providerId: event.target.value,
                  modelId: '',
                })
              }
              options={[
                { value: '', label: '不单独指定，使用全局默认聊天模型' },
                ...providers.map((provider) => ({
                  value: provider.id,
                  label: provider.name,
                })),
              ]}
            />

            {selectedProvider && (
              <>
                <Select
                  label="模型"
                  value={formData.modelId}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      modelId: event.target.value,
                    })
                  }
                  options={[
                    {
                      value: '',
                      label:
                        selectedProvider.models.length > 0
                          ? '请选择模型'
                          : '暂无模型，请先点击“刷新模型”',
                    },
                    ...selectedProvider.models.map((model) => ({
                      value: model,
                      label: model,
                    })),
                  ]}
                />

                {selectedProvider.models.length === 0 && (
                  <p className="text-xs text-mist-text-secondary">
                    此接口尚未获取模型。请点击右上方“刷新模型”，系统会依次请求
                    <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5">
                      /models
                    </code>
                    和
                    <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5">
                      /model
                    </code>
                    。
                  </p>
                )}
              </>
            )}

            <Textarea
              label="系统提示词"
              placeholder="定义角色的行为方式..."
              rows={6}
              value={formData.systemPrompt}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  systemPrompt: event.target.value,
                })
              }
            />

            <Textarea
              label="性格描述"
              placeholder="描述角色的性格特点..."
              rows={3}
              value={formData.personality}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  personality: event.target.value,
                })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    temperature: Number(event.target.value) || 0.7,
                  })
                }
              />

              <Input
                label="Max Tokens"
                type="number"
                min="100"
                step="100"
                value={formData.maxTokens}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    maxTokens: Number(event.target.value) || 2000,
                  })
                }
              />
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
