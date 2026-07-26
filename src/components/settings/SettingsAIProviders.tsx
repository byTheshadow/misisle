// src/components/settings/SettingsAIProviders.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useProvidersStore } from '@/lib/stores/providers'
import { useSettingsStore } from '@/lib/stores/settings'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { IconPlus, IconEdit, IconTrash, IconRefresh } from '@/components/icons'
import type { AIProvider } from '@/types'

export function SettingsAIProviders() {
  const {
    providers,
    isLoaded,
    loadProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    fetchModels,
    testConnection,
  } = useProvidersStore()

  const { settings, isLoaded: settingsLoaded, loadSettings, updateSettings } = useSettingsStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
  })

  const [loadingModels, setLoadingModels] = useState<string | null>(null)
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  useEffect(() => {
    if (!isLoaded) {
      loadProviders()
    }
  }, [isLoaded, loadProviders])

  useEffect(() => {
    if (!settingsLoaded) {
      loadSettings()
    }
  }, [settingsLoaded, loadSettings])

  const chatProvider = useMemo(() => {
    return providers.find((p) => p.id === settings?.ai.defaultChatProviderId)
  }, [providers, settings?.ai.defaultChatProviderId])

  const backgroundProvider = useMemo(() => {
    return providers.find((p) => p.id === settings?.ai.defaultBackgroundProviderId)
  }, [providers, settings?.ai.defaultBackgroundProviderId])

  const handleOpenModal = (provider?: AIProvider) => {
    if (provider) {
      setEditingProvider(provider)
      setFormData({
        name: provider.name,
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKey,
      })
    } else {
      setEditingProvider(null)
      setFormData({ name: '', baseUrl: '', apiKey: '' })
    }
    setStatusMessage('')
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.baseUrl) return

    if (editingProvider) {
      await updateProvider(editingProvider.id, formData)
    } else {
      await createProvider(formData)
    }
    setIsModalOpen(false)
  }

  const handleFetchModels = async (id: string) => {
    setLoadingModels(id)
    setStatusMessage('')
    try {
      const models = await fetchModels(id)
      setStatusMessage(`已获取 ${models.length} 个模型`)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      setStatusMessage('获取模型失败，请检查 Base URL、API Key 或服务是否可用')
    } finally {
      setLoadingModels(null)
    }
  }

  const handleTestConnection = async (id: string) => {
    setTestingProvider(id)
    setStatusMessage('')
    try {
      await testConnection(id)
      setStatusMessage('连接成功')
    } catch (error) {
      console.error('Failed to test connection:', error)
      setStatusMessage('连接失败，请检查 Base URL、API Key 或服务是否可用')
    } finally {
      setTestingProvider(null)
    }
  }

  if (!settings) return null

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">默认模型限制</h3>

        <div className="space-y-4">
          <div className="rounded-xl border border-mist-border bg-white/[0.03] p-3 space-y-3">
            <p className="text-sm text-mist-text">聊天模型</p>
            <p className="text-xs text-mist-text-secondary">
              所有普通聊天默认走这里选择的接口与模型。角色自身配置后续也可以继续作为更细粒度覆盖。
            </p>

            <Select
              label="聊天默认接口"
              value={settings.ai.defaultChatProviderId}
              onChange={(e) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultChatProviderId: e.target.value,
                    defaultChatModelId: '',
                  },
                })
              }
              options={[
                { value: '', label: '不指定' },
                ...providers.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />

            <Select
              label="聊天默认模型"
              value={settings.ai.defaultChatModelId}
              disabled={!chatProvider}
              onChange={(e) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultChatModelId: e.target.value,
                  },
                })
              }
              options={[
                { value: '', label: chatProvider ? '请选择模型' : '请先选择接口' },
                ...(chatProvider?.models ?? []).map((m) => ({ value: m, label: m })),
              ]}
            />
          </div>

          <div className="rounded-xl border border-mist-border bg-white/[0.03] p-3 space-y-3">
            <p className="text-sm text-mist-text">后台触发模型</p>
            <p className="text-xs text-mist-text-secondary">
              记忆整理、主动消息、定时任务等后台触发类能力默认走这里选择的接口与模型。
            </p>

            <Select
              label="后台默认接口"
              value={settings.ai.defaultBackgroundProviderId}
              onChange={(e) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultBackgroundProviderId: e.target.value,
                    defaultBackgroundModelId: '',
                  },
                })
              }
              options={[
                { value: '', label: '不指定' },
                ...providers.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />

            <Select
              label="后台默认模型"
              value={settings.ai.defaultBackgroundModelId}
              disabled={!backgroundProvider}
              onChange={(e) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultBackgroundModelId: e.target.value,
                  },
                })
              }
              options={[
                { value: '', label: backgroundProvider ? '请选择模型' : '请先选择接口' },
                ...(backgroundProvider?.models ?? []).map((m) => ({ value: m, label: m })),
              ]}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} size="sm">
          <IconPlus className="w-4 h-4 mr-2" />
          添加接口
        </Button>
      </div>

      {statusMessage && (
        <Card>
          <p className="text-sm text-mist-text-secondary">{statusMessage}</p>
        </Card>
      )}

      {providers.length === 0 ? (
        <Card>
          <p className="text-center text-mist-text-secondary py-8">
            暂无 AI 接口配置
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-mist-text">{provider.name}</h3>
                  <p className="text-sm text-mist-text-secondary mt-1 break-all">
                    {provider.baseUrl}
                  </p>

                  {provider.models.length > 0 ? (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-mist-text-secondary">
                        {provider.models.length} 个模型可用
                      </p>
                      <p className="text-xs text-mist-text-secondary/70 line-clamp-2">
                        {provider.models.join('、')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-mist-text-secondary mt-2">
                      尚未获取模型，请点击刷新按钮从 /models 或 /model 拉取。
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={testingProvider === provider.id}
                  >
                    {testingProvider === provider.id ? '测试中' : '连接'}
                  </Button>

                  <button
                    onClick={() => handleFetchModels(provider.id)}
                    disabled={loadingModels === provider.id}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    title="获取模型"
                  >
                    <IconRefresh
                      className={`w-4 h-4 text-mist-text-secondary ${
                        loadingModels === provider.id ? 'animate-spin' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleOpenModal(provider)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    title="编辑接口"
                  >
                    <IconEdit className="w-4 h-4 text-mist-text-secondary" />
                  </button>

                  <button
                    onClick={() => deleteProvider(provider.id)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    title="删除接口"
                  >
                    <IconTrash className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProvider ? '编辑接口' : '添加接口'}
      >
        <div className="space-y-4">
          <Input
            label="名称"
            placeholder="例如：OpenAI / 本地 Ollama / OpenAI Compatible"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Base URL"
            placeholder="例如：https://api.openai.com/v1"
            value={formData.baseUrl}
            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
          />

          <Input
            label="API Key"
            type="password"
            placeholder="sk-...，本地模型可留空"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          />

          <p className="text-xs text-mist-text-secondary">
            保存后可点击接口卡片右侧刷新按钮，系统会依次尝试请求 /models 与 /model 获取模型列表。
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
