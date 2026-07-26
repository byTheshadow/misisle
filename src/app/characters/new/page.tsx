// src/app/characters/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCharactersStore } from '@/lib/stores/characters'
import { useProvidersStore } from '@/lib/stores/providers'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

export default function NewCharacterPage() {
  const router = useRouter()
  const { createCharacter } = useCharactersStore()
  const {
    providers,
    isLoaded: providersLoaded,
    loadProviders,
  } = useProvidersStore()

  const [isSaving, setIsSaving] = useState(false)

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
    if (!providersLoaded) {
      loadProviders()
    }
  }, [providersLoaded, loadProviders])

  const selectedProvider = providers.find(
    (provider) => provider.id === formData.providerId
  )

  const handleSave = async () => {
    if (!formData.name.trim() || isSaving) return

    setIsSaving(true)

    try {
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
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="新建角色"
        backHref="/characters"
        actions={
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim() || isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        }
      />

      <main className="flex-1 p-4 space-y-4">
        <Card>
          <h3 className="text-sm font-medium text-mist-text mb-4">
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
          <div className="mb-4">
            <h3 className="text-sm font-medium text-mist-text">AI 配置</h3>
            <p className="mt-1 text-xs text-mist-text-secondary">
              可以不单独指定接口和模型。留空时，聊天会使用设置页里的全局默认聊天模型。
            </p>
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
                {
                  value: '',
                  label: '不单独指定，使用全局默认聊天模型',
                },
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
                          : '暂无模型，请先到设置页刷新模型',
                    },
                    ...selectedProvider.models.map((model) => ({
                      value: model,
                      label: model,
                    })),
                  ]}
                />

                {selectedProvider.models.length === 0 && (
                  <p className="text-xs leading-5 text-mist-text-secondary">
                    当前接口还没有模型列表。请先到
                    <span className="mx-1 text-mist-text">设置 → AI 接口</span>
                    中点击该接口的刷新按钮获取模型。
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
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    temperature: parseFloat(event.target.value) || 0.7,
                  })
                }
              />

              <Input
                label="Max Tokens"
                type="number"
                step="100"
                min="100"
                value={formData.maxTokens}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    maxTokens: parseInt(event.target.value) || 2000,
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
