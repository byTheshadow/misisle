// src/components/settings/SettingsAIProviders.tsx
'use client'

import { useEffect, useState } from 'react'
import { useProvidersStore } from '@/lib/stores/providers'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { IconPlus, IconEdit, IconTrash, IconRefresh } from '@/components/icons'
import type { AIProvider } from '@/types'

export function SettingsAIProviders() {
  const { providers, isLoaded, loadProviders, createProvider, updateProvider, deleteProvider, fetchModels } = useProvidersStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
  })
  const [loadingModels, setLoadingModels] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) {
      loadProviders()
    }
  }, [isLoaded, loadProviders])

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
    try {
      await fetchModels(id)
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setLoadingModels(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} size="sm">
          <IconPlus className="w-4 h-4 mr-2" />
          添加接口
        </Button>
      </div>

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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-mist-text">{provider.name}</h3>
                  <p className="text-sm text-mist-text-secondary mt-1 break-all">
                    {provider.baseUrl}
                  </p>
                  {provider.models.length > 0 && (
                    <p className="text-xs text-mist-text-secondary mt-2">
                      {provider.models.length} 个模型可用
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFetchModels(provider.id)}
                    disabled={loadingModels === provider.id}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
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
                  >
                    <IconEdit className="w-4 h-4 text-mist-text-secondary" />
                  </button>
                  <button
                    onClick={() => deleteProvider(provider.id)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
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
       // src/components/settings/SettingsAIProviders.tsx（续）

        <div className="space-y-4">
          <Input
            label="名称"
            placeholder="例如：本地 Ollama"
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
            placeholder="sk-..."
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          />
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

