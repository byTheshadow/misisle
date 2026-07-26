'use client'

import { useState } from 'react'
import { IconTrash } from '@/components/icons'
import type { ZicardMessage } from '@/types'

export function ZicardMessageBubble({
  message,
  onQuote,
  onDelete,
  onTrace,
  onDiary,
  onAcceptRequest,
  onRejectRequest,
}: {
  message: ZicardMessage
  onQuote: () => void
  onDelete: () => void
  onTrace: () => void
  onDiary: () => void
  onAcceptRequest?: () => void
  onRejectRequest?: () => void
}) {
  const isUser = message.sender === 'user'

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className="group max-w-[82%]">
        {message.quote && (
          <div className="mb-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-mist-text-secondary">
            引用：{message.quote.content}
          </div>
        )}

        <div
          className={
            isUser
              ? 'rounded-[18px_18px_4px_18px] bg-white/20 px-4 py-2 text-mist-text'
              : 'rounded-[18px_18px_18px_4px] bg-white/10 px-4 py-2 text-mist-text'
          }
        >
          {message.type === 'image-card' ? (
            <FlippableImageCard message={message} />
          ) : message.type === 'voice-card' ? (
            <VoiceCard message={message} />
          ) : message.type === 'zicard-request' ? (
            <div>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  className="rounded-lg bg-white/10 px-3 py-1 text-xs"
                  onClick={onAcceptRequest}
                >
                  留下
                </button>
                <button
                  className="rounded-lg bg-white/10 px-3 py-1 text-xs"
                  onClick={onRejectRequest}
                >
                  不用
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
          )}
        </div>

        <div className="mt-1 hidden group-hover:flex gap-2 text-[11px] text-mist-text-secondary">
          <button onClick={onQuote} className="hover:text-mist-text">
            引用
          </button>
          <button onClick={onTrace} className="hover:text-mist-text">
            留痕
          </button>
          <button onClick={onDiary} className="hover:text-mist-text">
            生成日记
          </button>
          <button onClick={onDelete} className="hover:text-red-300 inline-flex items-center gap-1">
            <IconTrash className="w-3 h-3" />
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

function FlippableImageCard({ message }: { message: ZicardMessage }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className="w-40 h-28 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-center text-sm"
      onClick={() => setFlipped((value) => !value)}
    >
      {flipped ? (
        <span className="px-3 text-mist-text-secondary">
          {message.imageBackText || message.content}
        </span>
      ) : (
        <span className="text-mist-text-secondary">
          {message.imageIcon || 'image'}
        </span>
      )}
    </button>
  )
}

function VoiceCard({ message }: { message: ZicardMessage }) {
  const [playing, setPlaying] = useState(false)

  return (
    <button
      type="button"
      className="min-w-40 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
      onClick={() => setPlaying((value) => !value)}
    >
      <div className="flex items-center gap-3">
        <span>{playing ? '▮▮' : '▶'}</span>
        <span className="text-sm">{message.voiceDuration || 6}"</span>
        <span className="text-xs text-mist-text-secondary">
          {playing ? '播放中…' : '点击播放'}
        </span>
      </div>
      {playing && (
        <p className="mt-3 text-xs text-mist-text-secondary">
          {message.voiceTranscript || message.content}
        </p>
      )}
    </button>
  )
}
