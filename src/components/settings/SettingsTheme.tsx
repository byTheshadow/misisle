// src/components/settings/SettingsTheme.tsx
'use client'

import { useSettingsStore } from '@/lib/stores/settings'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

const defaultCSSVariables = [
  { key: '--mist-bg', label: '背景色', default: '#0a0a0a' },
  { key: '--mist-surface', label: '表面色', default: '#141414' },
  { key: '--mist-border', label: '边框色', default: 'rgba(255, 255, 255, 0.1)' },
  { key: '--mist-text', label: '主文字色', default: '#f5f5f5' },
  { key: '--mist-text-secondary', label: '次文字色', default: '#a0a0a0' },
  { key: '--mist-accent', label: '强调色', default: '#ffffff' },
  { key: '--mist-glass-bg', label: '毛玻璃背景', default: 'rgba(20, 20, 20, 0.8)' },
  { key: '--mist-glass-blur', label: '毛玻璃模糊', default: '20px' },
]

export function SettingsTheme() {
  const { settings, updateSettings, updateCSSVariable } = useSettingsStore()

  if (!settings) return null

  const { theme } = settings

  const handleResetVariables = () => {
    const resetVariables: Record<string, string> = {}
    defaultCSSVariables.forEach((v) => {
      resetVariables[v.key] = v.default
    })
    updateSettings({
      theme: { ...theme, cssVariables: resetVariables },
    })
  }

  return (
    <div className="space-y-4">
      {/* 壁纸设置 */}
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">壁纸</h3>
        <Input
          label="壁纸 URL"
          placeholder="https://... 或留空使用纯色背景"
          value={theme.wallpaper}
          onChange={(e) =>
            updateSettings({ theme: { ...theme, wallpaper: e.target.value } })
          }
        />
        {theme.wallpaper && (
          <div className="mt-4 rounded-lg overflow-hidden h-32">
            <img
              src={theme.wallpaper}
              alt="壁纸预览"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </Card>

      {/* CSS 变量 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-mist-text">颜色变量</h3>
          <Button variant="ghost" size="sm" onClick={handleResetVariables}>
            重置默认
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {defaultCSSVariables.map((variable) => (
            <Input
              key={variable.key}
              label={variable.label}
              placeholder={variable.default}
              value={theme.cssVariables[variable.key] || ''}
              onChange={(e) => updateCSSVariable(variable.key, e.target.value)}
            />
          ))}
        </div>
      </Card>

      {/* 自定义 CSS */}
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">自定义 CSS</h3>
        <Textarea
          placeholder="在此输入自定义 CSS 代码..."
          rows={10}
          value={theme.customCSS}
          onChange={(e) =>
            updateSettings({ theme: { ...theme, customCSS: e.target.value } })
          }
          className="font-mono text-sm"
        />
        <p className="text-xs text-mist-text-secondary mt-2">
          自定义 CSS 会直接注入页面，请谨慎使用
        </p>
      </Card>
    </div>
  )
}
