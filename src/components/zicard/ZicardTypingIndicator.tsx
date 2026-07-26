'use client'

export function ZicardTypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-mist-text-secondary">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
          <span className="ml-2">{text || '正在输入…'}</span>
        </span>
      </div>
    </div>
  )
}
