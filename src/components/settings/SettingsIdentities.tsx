// src/components/settings/SettingsIdentities.tsx
'use client'

import { useEffect, useState } from 'react'
import { useIdentitiesStore } from '@/lib/stores/identities'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { IconPlus, IconEdit, IconTrash, IconCheck } from '@/components/icons'
import type { UserIdentity } from '@/types'

export function SettingsIdentities() {
  const {
    identities,
    isLoaded,
    loadIdentities,
    createIdentity,
    updateIdentity,
    deleteIdentity,
  } = useIdentitiesStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIdentity, setEditingIdentity] = useState<UserIdentity | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    description: '',
    isRealSelf: false,
  })

  useEffect(() => {
    if (!isLoaded) {
      loadIdentities()
    }
  }, [isLoaded, loadIdentities])

  const handleOpenModal = (identity?: UserIdentity) => {
    if (identity) {
      setEditingIdentity(identity)
      setFormData({
        name: identity.name,
        avatar: identity.avatar,
        description: identity.description,
        isRealSelf: identity.isRealSelf,
      })
    } else {
      setEditingIdentity(null)
      setFormData({
        name: '',
        avatar: '',
        description: '',
        isRealSelf: false,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) return

    if (editingIdentity) {
      await updateIdentity(editingIdentity.id, formData)
    } else {
      await createIdentity(formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个身份吗？')) {
      await deleteIdentity(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} size="sm">
          <IconPlus className="w-4 h-4 mr-2" />
          添加身份
        </Button>
      </div>

      {identities.length === 0 ? (
        <Card>
          <p className="text-center text-mist-text-secondary py-8">
            暂无身份配置
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {identities.map((identity) => (
            <Card key={identity.id}>
              <div className="flex items-start gap-4">
                <Avatar
                  src={identity.avatar}
                  name={identity.name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-mist-text truncate">
                      {identity.name}
                    </h3>
                    {identity.isRealSelf && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white/10 text-mist-text-secondary">
                        <IconCheck className="w-3 h-3" />
                        真实身份
                      </span>
                    )}
                  </div>
                  {identity.description && (
                    <p className="text-sm text-mist-text-secondary mt-1 line-clamp-2">
                      {identity.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(identity)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <IconEdit className="w-4 h-4 text-mist-text-secondary" />
                  </button>
                  <button
                    onClick={() => handleDelete(identity.id)}
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
        title={editingIdentity ? '编辑身份' : '添加身份'}
      >
        <div className="space-y-4">
          <Input
            label="名称"
            placeholder="身份名称"
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
            label="人设描述"
            placeholder="描述这个身份的背景、性格等..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isRealSelf}
              onChange={(e) => setFormData({ ...formData, isRealSelf: e.target.checked })}
              className="w-4 h-4 rounded border-mist-border bg-white/5"
            />
            <span className="text-sm text-mist-text">这是真实的我（用于日常模式）</span>
          </label>
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

