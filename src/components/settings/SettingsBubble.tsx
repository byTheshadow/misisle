// src/components/settings/SettingsBubble.tsx
'use client'

import { useSettingsStore } from '@/lib/stores/settings'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export function SettingsBubble() {
  const { settings, updateBubbleStyle } = useSettingsStore()

  if (!settings) return null

  const { bubble } = settings

  const updateCharacterBubble = (key: string, value: string) => {
    updateBubbleStyle({
      ...bubble,
      character: { ...bubble.character, [key]: value },
    })
  }

  const updateUserBubble = (key: string, value: string) => {
    updateBubbleStyle({
      ...bubble,
      user: { ...bubble.user, [key]: value },
    })
  }

  return (
    <div className="space-y-4">
      {/* 预览区 */}
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">预览</h3>
        <div className="space-y-3 p-4 rounded-lg bg-black/20">
          {/* 角色气泡 */}
          <div className="flex justify-start">
            <div
              className="max-w-[80%] px-4 py-2"
              style={{
                backgroundColor: bubble.character.bgColor,
                color: bubble.character.textColor,
                borderRadius: bubble.character.borderRadius,
                fontSize: bubble.character.fontSize,
                fontFamily: bubble.character.fontFamily,
              }}
            >
              这是角色的消息气泡
            </div>
          </div>
          {/* 用户气泡 */}
          <div className="flex justify-end">
            <div
              className="max-w-[80%] px-4 py-2"
              style={{
                backgroundColor: bubble.user.bgColor,
                color: bubble.user.textColor,
                borderRadius: bubble.user.borderRadius,
                fontSize: bubble.user.fontSize,
                fontFamily: bubble.user.fontFamily,
              }}
            >
              这是用户的消息气泡
            </div>
          </div>
        </div>
      </Card>

      {/* 角色气泡设置 */}
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">角色气泡</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="背景颜色"
            placeholder="rgba(255,255,255,0.1)"
            value={bubble.character.bgColor}
            onChange={(e) => updateCharacterBubble('bgColor', e.target.value)}
          />
          <Input
            label="文字颜色"
            placeholder="#f5f5f5"
            value={bubble.character.textColor}
            onChange={(e) => updateCharacterBubble('textColor', e.target.value)}
          />
          <Input
            label="圆角"
            placeholder="18px 18px 18px 4px"
            value={bubble.character.borderRadius}
            onChange={(e) => updateCharacterBubble('borderRadius', e.target.value)}
          />
          <Input
            label="字号"
            placeholder="15px"
            value={bubble.character.fontSize}
            onChange={(e) => updateCharacterBubble('fontSize', e.target.value)}
          />
          <div className="col-span-2">
            <Input
              label="字体"
              placeholder="system-ui, sans-serif"
              value={bubble.character.fontFamily}
              onChange={(e) => updateCharacterBubble('fontFamily', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* 用户气泡设置 */}
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">用户气泡</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="背景颜色"
            placeholder="rgba(255,255,255,0.2)"
            value={bubble.user.bgColor}
            onChange={(e) => updateUserBubble('bgColor', e.target.value)}
          />
          <Input
            label="文字颜色"
            placeholder="#f5f5f5"
            value={bubble.user.textColor}
            onChange={(e) => updateUserBubble('textColor', e.target.value)}
          />
          <Input
            label="圆角"
            placeholder="18px 18px 4px 18px"
            value={bubble.user.borderRadius}
            onChange={(e) => updateUserBubble('borderRadius', e.target.value)}
          />
          <Input
            label="字号"
            placeholder="15px"
            value={bubble.user.fontSize}
            onChange={(e) => updateUserBubble('fontSize', e.target.value)}
          />
          <div className="col-span-2">
            <Input
              label="字体"
              placeholder="system-ui, sans-serif"
              value={bubble.user.fontFamily}
              onChange={(e) => updateUserBubble('fontFamily', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* 通用设置 */}
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">通用设置</h3>
        <div className="space-y-4">
          <Select
            label="时间戳显示"
            value={bubble.showTimestamp}
            onChange={(e) =>
              updateBubbleStyle({
                ...bubble,
                showTimestamp: e.target.value as 'inline' | 'below' | 'hover' | 'none',
              })
            }
            options={[
              { value: 'inline', label: '行内显示' },
              { value: 'below', label: '气泡下方' },
              { value: 'hover', label: '悬浮显示' },
              { value: 'none', label: '不显示' },
            ]}
          />
          <Select
            label="时间格式"
            value={bubble.timestampFormat}
            onChange={(e) =>
              updateBubbleStyle({
                ...bubble,
                timestampFormat: e.target.value as '12h' | '24h',
              })
            }
            options={[
              { value: '24h', label: '24 小时制' },
              { value: '12h', label: '12 小时制' },
            ]}
          />
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={bubble.showReadStatus}
              onChange={(e) =>
                updateBubbleStyle({ ...bubble, showReadStatus: e.target.checked })
              }
              className="w-4 h-4 rounded border-mist-border bg-white/5"
            />
            <span className="text-sm text-mist-text">显示已读状态</span>
          </label>
        </div>
      </Card>
    </div>
  )
}
