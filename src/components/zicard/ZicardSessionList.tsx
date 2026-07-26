'use client'

import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import type { ZicardSession } from '@/types'

export function ZicardSessionList({
  sessions,
  currentSessionId,
  onSelect,
}: {
  sessions: ZicardSession[]
  currentSessionId: string | null
  onSelect: (sessionId: string) => void
}) {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className={
            currentSessionId === session.id ? 'bg-white/10' : 'hover:bg-white/5'
          }
          onClick={() => onSelect(session.id)}
        >
          <div className="flex items-center gap-3">
            <Avatar src={session.avatar} name={session.title} />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-mist-text truncate">{session.title}</div>
              <div className="text-xs text-mist-text-secondary truncate mt-1">
                {session.lastMessage || '还没有消息'}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
