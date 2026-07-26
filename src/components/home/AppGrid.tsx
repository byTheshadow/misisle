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

function EmojiIcon({
  emoji,
  className,
}: {
  emoji: string
  className?: string
}) {
  return (
    <span
      className={className}
      aria-hidden="true"
    >
      {emoji}
    </span>
  )
}

const IconTarot = ({ className }: { className?: string }) => (
  <EmojiIcon emoji="🔮" className={className} />
)

const IconNovelRP = ({ className }: { className?: string }) => (
  <EmojiIcon emoji="📖" className={className} />
)

const IconTodo = ({ className }: { className?: string }) => (
  <EmojiIcon emoji="✅" className={className} />
)

const IconVocab = ({ className }: { className?: string }) => (
  <EmojiIcon emoji="📝" className={className} />
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
          className="glass rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/5 transition-colors min-h-[128px]"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center">
            <app.icon className="w-7 h-7 text-mist-text text-2xl flex items-center justify-center" />
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
