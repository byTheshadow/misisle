// src/app/settings/page.tsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { SettingsGeneral } from '@/components/settings/SettingsGeneral'
import { SettingsAIProviders } from '@/components/settings/SettingsAIProviders'
import { SettingsIdentities } from '@/components/settings/SettingsIdentities'
import { SettingsBubble } from '@/components/settings/SettingsBubble'
import { SettingsTheme } from '@/components/settings/SettingsTheme'

const tabs = [
  { id: 'general', label: '通用' },
  { id: 'ai', label: 'AI 接口' },
  { id: 'identities', label: '身份' },
  { id: 'bubble', label: '气泡' },
  { id: 'theme', label: '主题' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="设置" backHref="/" />

      <div className="p-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <main className="flex-1 p-4 pt-0">
        {activeTab === 'general' && <SettingsGeneral />}
        {activeTab === 'ai' && <SettingsAIProviders />}
        {activeTab === 'identities' && <SettingsIdentities />}
        {activeTab === 'bubble' && <SettingsBubble />}
        {activeTab === 'theme' && <SettingsTheme />}
      </main>
    </div>
  )
}
