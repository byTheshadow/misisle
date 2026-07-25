// src/components/home/AppGrid.tsx
'use client'

import Link from 'next/link'
import {
  IconChat,
  IconZicard,
  IconCharacter,
  IconMemory,
  IconKnowledge,
  IconSettings,
} from '@/components/icons'

interface AppItem {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const apps: AppItem[] = [
  {
    id: 'chat',
    name: '短信',
    href: '/chat',
    icon: IconChat,
    description: '与角色对话',
  },
  {
    id: 'zicard',
    name: '字卡',
    href: '/zicard',
    icon: IconZicard,
    description: '字卡传讯',
  },
  {
    id: 'characters',
    name: '角色',
    href: '/characters',
    icon: IconCharacter,
    description: '管理角色',
  },
  {
    id: 'memory',
    name: '记忆',
    href: '/memory',
    icon: IconMemory,
    description: '记忆系统',
  },
  {
    id: 'knowledge',
    name: '知识库',
    href: '/knowledge',
    icon: IconKnowledge,
    description: '知识管理',
  },
  {
    id: 'settings',
    name: '设置',
    href: '/settings',
    icon: IconSettings,
    description: '系统设置',
  },
]

export function AppGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {apps.map((app) => (
        <Link
          key={app.id}
          href={app.href}
          className="glass rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors"
        >
          <app.icon className="w-8 h-8 text-mist-text" />
          <span className="text-sm text-mist-text">{app.name}</span>
        </Link>
      ))}
    </div>
  )
}
