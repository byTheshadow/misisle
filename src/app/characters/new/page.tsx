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
  const { providers, isLoaded: providersLoaded, loadProviders } = useProvidersStore()

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

  const selectedProvider = providers.find((p) => p.id === formData.providerId)

  const handleSave = async () => {
    if (!formData.name) return

    await createCharacter({
      name: formData.name,
      avatar: formData.avatar,
      description: formData.description,
      relationship: formData.relationship,
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

    router.push('/characters')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="新建角色"
        backHref="/characters"
        actions={
          <Button onClick={handleSave} disabled={!formData.name}>
            保存
          </Button>
        }
      />

      <main className="flex-1 p-4 space-y-4">
        {/* 基础信息 */}
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

        {/* AI 配置 */}
        <Card>
          <h3 className="text-sm font-medium text-mist-text mb-4">AI 配置</h3>
          <div className="space-y-4">
            <Select
              label="AI 接口"
              value={formData.providerId}
              onChange={(e) => setFormData({ ...formData, providerId: e.target.value, modelId: '' })}
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
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0.7 })}
              />
              <Input
                label="Max Tokens"
                type="number"
                step="100"
                min="100"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 2000 })}
              />
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
