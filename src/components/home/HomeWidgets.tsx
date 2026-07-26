'use client'

import { useMemo, useState } from 'react'
import { useSettingsStore } from '@/lib/stores/settings'
import type { HomeProfileSettings } from '@/types'

function getTogetherDays(startDate: string) {
  const start = new Date(startDate).getTime()

  if (Number.isNaN(start)) {
    return 1
  }

  const diff = Date.now() - start
  return Math.max(1, Math.floor(diff / 86_400_000) + 1)
}

function ImageFallbackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5.2 6.1c0-1.1.9-2 2-2h9.6c1.1 0 2 .9 2 2v11.8c0 1.1-.9 2-2 2H7.2c-1.1 0-2-.9-2-2V6.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m7.8 16 2.9-3.2 2.2 2.3 1.5-1.6 1.8 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.6h.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 6.8c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v6.7c0 1.1-.9 2-2 2h-4.1l-4.2 3.7v-3.7H7c-1.1 0-2-.9-2-2V6.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.8h7M8.5 11.7h4.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.8 5.2h10.4c1.1 0 2 .9 2 2v10.2c0 1.1-.9 2-2 2H6.8c-1.1 0-2-.9-2-2V7.2c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8.2 4v3M15.8 4v3M5.2 9h13.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HomeWidgets() {
  const { settings, updateHomeProfile } = useSettingsStore()
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const home = settings?.home

  const togetherDays = useMemo(() => {
    return getTogetherDays(home?.together.startDate ?? '2024-01-01')
  }, [home?.together.startDate])

  if (!home) {
    return (
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-mist-text-secondary">正在加载首页配置……</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <article className="glass rounded-[28px] overflow-hidden lg:col-span-7 min-h-[260px] border border-white/10">
          <div className="relative h-32 bg-white/[0.04]">
            {home.profile.backgroundUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={home.profile.backgroundUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/35" />
          </div>

          <div className="p-5 -mt-10 relative">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-end gap-4 min-w-0">
                <div className="w-20 h-20 rounded-[24px] bg-white/[0.08] border border-white/15 overflow-hidden flex items-center justify-center text-mist-text shadow-xl">
                  {home.profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={home.profile.avatarUrl}
                      alt={home.profile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageFallbackIcon className="w-8 h-8 opacity-70" />
                  )}
                </div>

                <div className="pb-1 min-w-0">
                  <h2 className="text-xl text-mist-text font-light truncate">
                    {home.profile.displayName}
                  </h2>
                  <p className="text-sm text-mist-text-secondary mt-1 line-clamp-2">
                    {home.profile.signature}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="shrink-0 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 px-4 py-2 text-xs text-mist-text transition-colors"
              >
                编辑
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[11px] text-mist-text-secondary">头像</p>
                <p className="text-sm text-mist-text mt-1">
                  {home.profile.avatarUrl ? '已设置' : '未设置'}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[11px] text-mist-text-secondary">背景</p>
                <p className="text-sm text-mist-text mt-1">
                  {home.profile.backgroundUrl ? '已设置' : '未设置'}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[11px] text-mist-text-secondary">签名</p>
                <p className="text-sm text-mist-text mt-1">
                  {home.profile.signature ? '已设置' : '未设置'}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="glass rounded-[28px] p-5 lg:col-span-5 min-h-[260px] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-mist-text-secondary">
                {home.together.title}
              </p>
              <CalendarIcon className="w-5 h-5 text-mist-text-secondary" />
            </div>

            <div className="flex items-end gap-2 mt-4">
              <span className="text-6xl font-light text-mist-text tracking-tight">
                {togetherDays}
              </span>
              <span className="text-sm text-mist-text-secondary mb-2">天</span>
            </div>

            <p className="text-sm text-mist-text-secondary mt-4 leading-6">
              {home.together.note}
            </p>
          </div>

          <div className="flex items-center mt-6">
            <AvatarSlot imageUrl={home.together.leftAvatarUrl} />
            <AvatarSlot imageUrl={home.together.rightAvatarUrl} overlap />
          </div>
        </article>

        <article className="glass rounded-[28px] p-5 lg:col-span-6 min-h-[190px] border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base text-mist-text font-light">AI 留言板</h3>
              <p className="text-xs text-mist-text-secondary mt-1">
                根据离开时间计算，支持 AI 生成或仅字卡。
              </p>
            </div>
            <MessageIcon className="w-5 h-5 text-mist-text-secondary" />
          </div>

          <div className="mt-5 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
            <p className="text-sm text-mist-text leading-6">
              这里会显示角色在你离开期间留下的内容。
            </p>
            <p className="text-xs text-mist-text-secondary mt-3">
              当前模式：
              {home.messageBoard.mode === 'ai' ? 'AI 生成' : '仅字卡'}
            </p>
          </div>
        </article>

        <ImageWidget
          title={home.images.largeTitle}
          imageUrl={home.images.largeImageUrl}
          className="lg:col-span-3"
        />

        <ImageWidget
          title={home.images.smallTitle}
          imageUrl={home.images.smallImageUrl}
          className="lg:col-span-3"
        />
      </div>

      {isEditingProfile && (
        <HomeProfileEditor
          profile={home.profile}
          onClose={() => setIsEditingProfile(false)}
          onSave={async (profile) => {
            await updateHomeProfile(profile)
            setIsEditingProfile(false)
          }}
        />
      )}
    </>
  )
}

function AvatarSlot({
  imageUrl,
  overlap = false,
}: {
  imageUrl: string
  overlap?: boolean
}) {
  return (
    <div
      className={[
        'w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/15 overflow-hidden flex items-center justify-center text-mist-text',
        overlap ? '-ml-3' : '',
      ].join(' ')}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <ImageFallbackIcon className="w-6 h-6 opacity-70" />
      )}
    </div>
  )
}

function ImageWidget({
  title,
  imageUrl,
  className,
}: {
  title: string
  imageUrl: string
  className?: string
}) {
  return (
    <article
      className={[
        'glass rounded-[28px] overflow-hidden min-h-[190px] border border-white/10',
        className ?? '',
      ].join(' ')}
    >
      <div className="h-28 bg-white/[0.04] flex items-center justify-center text-mist-text-secondary">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <ImageFallbackIcon className="w-8 h-8 opacity-70" />
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm text-mist-text">{title}</h3>
        <p className="text-xs text-mist-text-secondary mt-1">
          后续可在首页编辑中调整图片地址。
        </p>
      </div>
    </article>
  )
}

function HomeProfileEditor({
  profile,
  onClose,
  onSave,
}: {
  profile: HomeProfileSettings
  onClose: () => void
  onSave: (profile: HomeProfileSettings) => Promise<void>
}) {
  const [draft, setDraft] = useState<HomeProfileSettings>(profile)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave({
        displayName: draft.displayName.trim() || '我的主页',
        signature: draft.signature.trim(),
        avatarUrl: draft.avatarUrl.trim(),
        backgroundUrl: draft.backgroundUrl.trim(),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl glass rounded-[28px] border border-white/10 p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg text-mist-text font-light">编辑主页卡</h2>
            <p className="text-xs text-mist-text-secondary mt-1">
              这些内容会保存到本地设置中。
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-3 py-2 text-xs text-mist-text transition-colors"
          >
            关闭
          </button>
        </div>

        <div className="space-y-4">
          <Field
            label="显示名"
            value={draft.displayName}
            onChange={(value) =>
              setDraft((current) => ({ ...current, displayName: value }))
            }
            placeholder="例如：我的主页"
          />

          <Field
            label="个性签名"
            value={draft.signature}
            onChange={(value) =>
              setDraft((current) => ({ ...current, signature: value }))
            }
            placeholder="写一句留在首页的话"
          />

          <Field
            label="头像 URL"
            value={draft.avatarUrl}
            onChange={(value) =>
              setDraft((current) => ({ ...current, avatarUrl: value }))
            }
            placeholder="https://..."
          />

          <Field
            label="背景图 URL"
            value={draft.backgroundUrl}
            onChange={(value) =>
              setDraft((current) => ({ ...current, backgroundUrl: value }))
            }
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 px-4 py-2 text-sm text-mist-text transition-colors"
          >
            取消
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-2xl bg-white/[0.14] hover:bg-white/[0.18] border border-white/10 px-4 py-2 text-sm text-mist-text transition-colors disabled:opacity-60"
          >
            {isSaving ? '保存中' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="text-xs text-mist-text-secondary">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-mist-text outline-none focus:border-white/25 placeholder:text-mist-text-secondary/60"
      />
    </label>
  )
}
