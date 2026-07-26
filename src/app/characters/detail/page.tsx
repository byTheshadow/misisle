// src/app/characters/detail/page.tsx
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
  const characterId = searchParams.get('id') || ''

  const {
    characters,
    isLoaded: charactersLoaded,
    loadCharacters,
    updateCharacter,
    deleteCharacter,
    getCharacter,
  } = useCharactersStore()

  const {
    providers,
    isLoaded: providersLoaded,
    loadProviders,
    fetchModels,
  } = useProvidersStore()

  const [isReady, setIsReady] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)

  const character = useMemo(() => {
    if (!characterId) return undefined
    return getCharacter(characterId)
  }, [characterId, characters, getCharacter])

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

    if (!characterId || !character) {
      setIsReady(true)
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
    setIsReady(true)
  }, [charactersLoaded, characterId, character])

  const selectedProvider = providers.find((p) => p.id === formData.providerId)

  const handleSave = async () => {
    if (!character || !formData.name) return

    await updateCharacter(character.id, {
      name: formData.name,
      avatar: formData.avatar,
      description: formData.description,
      relationship: formData.relationship,
      ai: {
        ...character.ai,
        providerId: formData.providerId,
        modelId: formData.modelId,
        systemPrompt: formData.systemPrompt,
        personality: formData.personality,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
      },
    })

    router.push('/characters')
  }

  const handleDelete = async () => {
    if (!character) return

    if (confirm(`确定要删除角色「${character.name}」吗？关联聊天、记忆和字卡库也会被删除。`)) {
      await deleteCharacter(character.id)
      router.push('/characters')
    }
  }

  const handleFetchModels = async () => {
    if (!formData.providerId) return

    setLoadingModels(true)
    try {
      await fetchModels(formData.providerId)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      alert('获取模型失败，请检查接口配置。')
    } finally {
      setLoadingModels(false)
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader title="编辑角色" backHref="/characters" />
        <main className="flex-1 p-4">
          <Card>
            <p className="text-center text-mist-text-secondary py-8">正在加载角色...</p>
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
            <p className="text-center text-mist-text-secondary py-8">
              没有找到这个角色，可能已经被删除。
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
            <Button onClick={handleSave} disabled={!formData.name}>
              保存
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 space-y-4">
        <Card>
          <h3 className="text-sm font-medium text-mist-text mb-4">基础信息</h3>
          <div className="space-y-4">
            <Input
              label="名称"
              placeholder="角色名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="头像 URL"
              placeholder="https://..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            />

            <Textarea
              label="描述"
              placeholder="角色的简短描述..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Input
              label="与你的关系"
              placeholder="例如：恋人、朋友、同事..."
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-medium text-mist-text">AI 配置</h3>
            {formData.providerId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFetchModels}
                disabled={loadingModels}
              >
                {loadingModels ? '获取中...' : '刷新模型'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Select
              label="AI 接口"
              value={formData.providerId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  providerId: e.target.value,
                  modelId: '',
                })
              }
              options={[
                { value: '', label: '请选择接口' },
                ...providers.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />

            {selectedProvider && (
              <Select
                label="模型"
                value={formData.modelId}
                onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                options={[
                  { value: '', label: '请选择模型' },
                  ...selectedProvider.models.map((m) => ({ value: m, label: m })),
                ]}
              />
            )}

            <Textarea
              label="系统提示词"
              placeholder="定义角色的行为方式..."
              rows={6}
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            />

            <Textarea
              label="性格描述"
              placeholder="描述角色的性格特点..."
              rows={3}
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: parseFloat(e.target.value) || 0.7,
                  })
                }
              />

              <Input
                label="Max Tokens"
                type="number"
                step="100"
                min="100"
                value={formData.maxTokens}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxTokens: parseInt(e.target.value) || 2000,
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
