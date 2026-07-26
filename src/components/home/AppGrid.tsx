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

const IconTarot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M8.2 4.8h7.6c.9 0 1.6.7 1.6 1.6v11.2c0 .9-.7 1.6-1.6 1.6H8.2c-.9 0-1.6-.7-1.6-1.6V6.4c0-.9.7-1.6 1.6-1.6Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 8.1v7.8M9.7 10.1h4.6M9.7 13.9h4.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const IconNovelRP = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M5.4 5.4h8.4c1.2 0 2.2 1 2.2 2.2v11H7.6c-1.2 0-2.2-1-2.2-2.2v-11Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M16 7.5h1.4c1.2 0 2.2 1 2.2 2.2v8.9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8.1 8.7h5.1M8.1 11.7h5.8M8.1 14.7h3.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const IconTodo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M7.2 5.2h9.6c1.1 0 2 .9 2 2v9.6c0 1.1-.9 2-2 2H7.2c-1.1 0-2-.9-2-2V7.2c0-1.1.9-2 2-2Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="m8.4 12.2 2.2 2.2 5-5.1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconVocab = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M6.2 5.3h8.2c1.1 0 2 .9 2 2v11.4H8.2c-1.1 0-2-.9-2-2V5.3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M16.4 7.5h1.4c1.1 0 2 .9 2 2v9.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8.8 9h4.4M8.8 12h3.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const apps: AppItem[] = [
  {
    id: 'chat',
    name: '短信',
    href: '/chat',
    icon: IconChat,
    description: '日常感、线下模式与短 RP',
  },
  {
    id: 'novel-rp',
    name: '小说 RP',
    href: '/novel-rp',
    icon: IconNovelRP,
    description: '长 RP 与小说感写作',
  },
  {
    id: 'tarot',
    name: '塔罗占卜',
    href: '/tarot',
    icon: IconTarot,
    description: '塔罗、雷诺曼与牌阵',
  },
  {
    id: 'todo',
    name: 'TodoList',
    href: '/todo',
    icon: IconTodo,
    description: '待办与生活计划',
  },
  {
    id: 'vocab',
    name: '背单词',
    href: '/vocab',
    icon: IconVocab,
    description: '单词卡片与角色提醒',
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-4">
      {apps.map((app) => (
        <Link
          key={app.id}
          href={app.href}
          className="glass rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/[0.06] transition-colors min-h-[132px] border border-white/10"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-mist-text">
            <app.icon className="w-6 h-6" />
          </div>

          <div>
            <span className="text-sm text-mist-text">{app.name}</span>
            <p className="text-xs text-mist-text-secondary mt-1 leading-5">
              {app.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

