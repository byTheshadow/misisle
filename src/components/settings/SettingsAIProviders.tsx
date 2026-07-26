'use client'

import { useEffect, useMemo, useState } from 'react'
import { useProvidersStore } from '@/lib/stores/providers'
import { useSettingsStore } from '@/lib/stores/settings'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
} from '@/components/icons'
import type { AIProvider } from '@/types'

export function SettingsAIProviders() {
  const {
    providers,
    isLoaded: providersLoaded,
    loadProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    fetchModels,
    testConnection,
  } = useProvidersStore()

  const {
    settings,
    isLoaded: settingsLoaded,
    loadSettings,
    updateSettings,
  } = useSettingsStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(
    null
  )

  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
  })

  const [loadingModelsId, setLoadingModelsId] = useState<string | null>(null)
  const [testingProviderId, setTestingProviderId] = useState<string | null>(
    null
  )
  const [notice, setNotice] = useState<string>('')

  useEffect(() => {
    if (!providersLoaded) {
      loadProviders()
    }
  }, [providersLoaded, loadProviders])

  useEffect(() => {
    if (!settingsLoaded) {
      loadSettings()
    }
  }, [settingsLoaded, loadSettings])

  const chatProvider = useMemo(() => {
    if (!settings) return undefined

    return providers.find(
      (provider) => provider.id === settings.ai.defaultChatProviderId
    )
  }, [providers, settings])

  const backgroundProvider = useMemo(() => {
    if (!settings) return undefined

    return providers.find(
      (provider) =>
        provider.id === settings.ai.defaultBackgroundProviderId
    )
  }, [providers, settings])

  const handleOpenModal = (provider?: AIProvider) => {
    setNotice('')

    if (provider) {
      setEditingProvider(provider)
      setFormData({
        name: provider.name,
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKey,
      })
    } else {
      setEditingProvider(null)
      setFormData({
        name: '',
        baseUrl: '',
        apiKey: '',
      })
    }

    setIsModalOpen(true)
  }

  const handleSaveProvider = async () => {
    if (!formData.name.trim() || !formData.baseUrl.trim()) {
      setNotice('请填写接口名称和 Base URL。')
      return
    }

    const data = {
      name: formData.name.trim(),
      baseUrl: formData.baseUrl.trim().replace(/\/+$/, ''),
      apiKey: formData.apiKey.trim(),
    }

    if (editingProvider) {
      await updateProvider(editingProvider.id, data)
      setNotice('接口已保存。')
    } else {
      await createProvider(data)
      setNotice('接口已添加。请点击刷新按钮获取模型列表。')
    }

    setIsModalOpen(false)
  }

  const handleFetchModels = async (providerId: string) => {
    setLoadingModelsId(providerId)
    setNotice('')

    try {
      const models = await fetchModels(providerId)

      if (models.length === 0) {
        setNotice(
          '接口响应成功，但未识别到模型列表。请确认接口返回格式，或检查 /models、/model 是否可用。'
        )
        return
      }

      setNotice(`已获取 ${models.length} 个模型，现在可以在上方下拉栏选择默认模型。`)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      setNotice(
        '获取模型失败。请检查 Base URL、API Key、浏览器网络权限，以及服务是否支持 OpenAI 兼容的 /models 或 /model 接口。'
      )
    } finally {
      setLoadingModelsId(null)
    }
  }

  const handleTestConnection = async (providerId: string) => {
    setTestingProviderId(providerId)
    setNotice('')

    try {
      await testConnection(providerId)
      setNotice('接口连接成功。你可以继续点击刷新按钮获取模型列表。')
    } catch (error) {
      console.error('Failed to test provider connection:', error)
      setNotice(
        '接口连接失败。请检查 Base URL、API Key、CORS 配置和接口服务状态。'
      )
    } finally {
      setTestingProviderId(null)
    }
  }

  const handleDeleteProvider = async (provider: AIProvider) => {
    const confirmed = confirm(`确定要删除接口「${provider.name}」吗？`)
    if (!confirmed) return

    if (settings) {
      const isChatProvider =
        settings.ai.defaultChatProviderId === provider.id
      const isBackgroundProvider =
        settings.ai.defaultBackgroundProviderId === provider.id

      if (isChatProvider || isBackgroundProvider) {
        await updateSettings({
          ai: {
            ...settings.ai,
            ...(isChatProvider
              ? {
                  defaultChatProviderId: '',
                  defaultChatModelId: '',
                }
              : {}),
            ...(isBackgroundProvider
              ? {
                  defaultBackgroundProviderId: '',
                  defaultBackgroundModelId: '',
                }
              : {}),
          },
        })
      }
    }

    await deleteProvider(provider.id)
    setNotice('接口已删除。')
  }

  if (!settings) {
    return (
      <Card>
        <p className="py-8 text-center text-mist-text-secondary">
          正在加载设置...
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-mist-text">
            默认模型分配
          </h3>
          <p className="mt-1 text-xs leading-5 text-mist-text-secondary">
            在这里设置全局默认模型。普通聊天与后台任务可以使用不同模型，以控制成本、速度和能力。
            角色页中的接口和模型属于角色级覆盖配置。
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-3 rounded-xl border border-mist-border bg-white/[0.03] p-4">
            <div>
              <h4 className="text-sm font-medium text-mist-text">
                聊天默认模型
              </h4>
              <p className="mt-1 text-xs text-mist-text-secondary">
                用于所有没有单独指定模型的普通聊天。
              </p>
            </div>

            <Select
              label="默认聊天接口"
              value={settings.ai.defaultChatProviderId}
              onChange={(event) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultChatProviderId: event.target.value,
                    defaultChatModelId: '',
                  },
                })
              }
              options={[
                { value: '', label: '请选择接口' },
                ...providers.map((provider) => ({
                  value: provider.id,
                  label: provider.name,
                })),
              ]}
            />

            <Select
              label="默认聊天模型"
              value={settings.ai.defaultChatModelId}
              disabled={!chatProvider || chatProvider.models.length === 0}
              onChange={(event) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultChatModelId: event.target.value,
                  },
                })
              }
              options={[
                {
                  value: '',
                  label: !chatProvider
                    ? '请先选择接口'
                    : chatProvider.models.length === 0
                      ? '该接口暂无模型，请先刷新模型'
                      : '请选择模型',
                },
                ...(chatProvider?.models ?? []).map((model) => ({
                  value: model,
                  label: model,
                })),
              ]}
            />

            {chatProvider && chatProvider.models.length === 0 && (
              <p className="text-xs text-mist-text-secondary">
                「{chatProvider.name}」尚未获取模型。请在下方接口卡片点击刷新图标。
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-mist-border bg-white/[0.03] p-4">
            <div>
              <h4 className="text-sm font-medium text-mist-text">
                后台触发默认模型
              </h4>
              <p className="mt-1 text-xs text-mist-text-secondary">
                用于记忆整理、定时主动消息、TodoList 时间触发及后续后台自动化能力。
              </p>
            </div>

            <Select
              label="默认后台接口"
              value={settings.ai.defaultBackgroundProviderId}
              onChange={(event) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultBackgroundProviderId: event.target.value,
                    defaultBackgroundModelId: '',
                  },
                })
              }
              options={[
                { value: '', label: '请选择接口' },
                ...providers.map((provider) => ({
                  value: provider.id,
                  label: provider.name,
                })),
              ]}
            />

            <Select
              label="默认后台模型"
              value={settings.ai.defaultBackgroundModelId}
              disabled={
                !backgroundProvider || backgroundProvider.models.length === 0
              }
              onChange={(event) =>
                updateSettings({
                  ai: {
                    ...settings.ai,
                    defaultBackgroundModelId: event.target.value,
                  },
                })
              }
              options={[
                {
                  value: '',
                  label: !backgroundProvider
                    ? '请先选择接口'
                    : backgroundProvider.models.length === 0
                      ? '该接口暂无模型，请先刷新模型'
                      : '请选择模型',
                },
                ...(backgroundProvider?.models ?? []).map((model) => ({
                  value: model,
                  label: model,
                })),
              ]}
            />

            {backgroundProvider &&
              backgroundProvider.models.length === 0 && (
                <p className="text-xs text-mist-text-secondary">
                  「{backgroundProvider.name}」尚未获取模型。请在下方接口卡片点击刷新图标。
                </p>
              )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          添加接口
        </Button>
      </div>

      {notice && (
        <Card>
          <p className="text-sm leading-6 text-mist-text-secondary">
            {notice}
          </p>
        </Card>
      )}

      {providers.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-mist-text-secondary">
            暂无 AI 接口配置。添加接口后，刷新模型列表并在上方选择默认模型。
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-mist-text">
                    {provider.name}
                  </h3>

                  <p className="mt-1 break-all text-sm text-mist-text-secondary">
                    {provider.baseUrl}
                  </p>

                  {provider.models.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs text-mist-text-secondary">
                        已获取 {provider.models.length} 个模型
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-mist-text-secondary/70">
                        {provider.models.join('、')}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-mist-text-secondary">
                      暂未获取模型。点击右侧刷新图标后，模型会出现在页面顶部的下拉选择框中。
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={testingProviderId === provider.id}
                  >
                    {testingProviderId === provider.id ? '测试中' : '连接'}
                  </Button>

                  <button
                    type="button"
                    title="获取模型"
                    aria-label={`获取 ${provider.name} 的模型`}
                    onClick={() => handleFetchModels(provider.id)}
                    disabled={loadingModelsId === provider.id}
                    className="rounded-lg p-2 transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    <IconRefresh
                      className={`h-4 w-4 text-mist-text-secondary ${
                        loadingModelsId === provider.id
                          ? 'animate-spin'
                          : ''
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    title="编辑接口"
                    aria-label={`编辑 ${provider.name}`}
                    onClick={() => handleOpenModal(provider)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/5"
                  >
                    <IconEdit className="h-4 w-4 text-mist-text-secondary" />
                  </button>

                  <button
                    type="button"
                    title="删除接口"
                    aria-label={`删除 ${provider.name}`}
                    onClick={() => handleDeleteProvider(provider)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/5"
                  >
                    <IconTrash className="h-4 w-4 text-red-400" />
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
            placeholder="例如：OpenAI、DeepSeek、本地 Ollama"
            value={formData.name}
            onChange={(event) =>
              setFormData({
                ...formData,
                name: event.target.value,
              })
            }
          />

          <Input
            label="Base URL"
            placeholder="例如：https://api.openai.com/v1"
            value={formData.baseUrl}
            onChange={(event) =>
              setFormData({
                ...formData,
                baseUrl: event.target.value,
              })
            }
          />

          <Input
            label="API Key"
            type="password"
            placeholder="sk-...；无密钥的本地服务可留空"
            value={formData.apiKey}
            onChange={(event) =>
              setFormData({
                ...formData,
                apiKey: event.target.value,
              })
            }
          />

          <p className="text-xs leading-5 text-mist-text-secondary">
            当前按 OpenAI Compatible 接口处理。保存后，在接口卡片点击刷新图标，系统会优先请求
            <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5">
              /models
            </code>
            ，失败时再请求
            <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5">
              /model
            </code>
            。
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveProvider}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

