// src/components/settings/SettingsGeneral.tsx
'use client'

import { useSettingsStore } from '@/lib/stores/settings'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function SettingsGeneral() {
  const { settings, updateSettings } = useSettingsStore()

  if (!settings) return null

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">后台触发</h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.backgroundTriggers.enabled}
              onChange={(e) =>
                updateSettings({
                  backgroundTriggers: {
                    ...settings.backgroundTriggers,
                    enabled: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-mist-border bg-white/5"
            />
            <span className="text-sm text-mist-text">启用后台自动触发</span>
          </label>

          <Input
            label="自动触发间隔（分钟）"
            type="number"
            min="5"
            step="5"
            value={settings.backgroundTriggers.intervalMinutes}
            disabled={!settings.backgroundTriggers.enabled}
            onChange={(e) =>
              updateSettings({
                backgroundTriggers: {
                  ...settings.backgroundTriggers,
                  intervalMinutes: parseInt(e.target.value) || 60,
                },
              })
            }
          />

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={settings.backgroundTriggers.useTodoTime}
              disabled={!settings.backgroundTriggers.enabled}
              onChange={(e) =>
                updateSettings({
                  backgroundTriggers: {
                    ...settings.backgroundTriggers,
                    useTodoTime: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 mt-0.5 rounded border-mist-border bg-white/5"
            />
            <span className="text-sm text-mist-text">
              根据 TodoList 任务时间触发
              <span className="block text-xs text-mist-text-secondary mt-1">
                当前先保存开关。TodoList 模块接入后，后台任务可根据待办事项的提醒时间或截止时间触发。
              </span>
            </span>
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">记忆系统</h3>
        <div className="space-y-4">
          <Input
            label="自动提取阈值（消息数）"
            type="number"
            value={settings.memory.autoExtractThreshold}
            onChange={(e) =>
              updateSettings({
                memory: {
                  ...settings.memory,
                  autoExtractThreshold: parseInt(e.target.value) || 30,
                },
              })
            }
          />
          <Input
            label="Prompt 最大 Token 数"
            type="number"
            value={settings.memory.maxTokensInPrompt}
            onChange={(e) =>
              updateSettings({
                memory: {
                  ...settings.memory,
                  maxTokensInPrompt: parseInt(e.target.value) || 4000,
                },
              })
            }
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">字卡设置</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.zicard.enableDailyRitual}
              onChange={(e) =>
                updateSettings({
                  zicard: {
                    ...settings.zicard,
                    enableDailyRitual: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-mist-border bg-white/5"
            />
            <span className="text-sm text-mist-text">启用每日仪式</span>
          </label>
          {settings.zicard.enableDailyRitual && (
            <Input
              label="冥想时长（秒）"
              type="number"
              value={settings.zicard.ritualDurationSeconds}
              onChange={(e) =>
                updateSettings({
                  zicard: {
                    ...settings.zicard,
                    ritualDurationSeconds: parseInt(e.target.value) || 5,
                  },
                })
              }
            />
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-mist-text mb-4">通知设置</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.enabled}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...settings.notifications,
                    enabled: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-mist-border bg-white/5"
            />
            <span className="text-sm text-mist-text">启用推送通知</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="免打扰开始"
              type="time"
              value={settings.notifications.quietHoursStart}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...settings.notifications,
                    quietHoursStart: e.target.value,
                  },
                })
              }
            />
            <Input
              label="免打扰结束"
              type="time"
              value={settings.notifications.quietHoursEnd}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...settings.notifications,
                    quietHoursEnd: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
