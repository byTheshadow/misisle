'use client'

import Link from 'next/link'
import { ChangeEvent, useMemo, useRef, useState } from 'react'
import { useSettingsStore } from '@/lib/stores/settings'
import type {
  HomeImageSettings,
  HomeProfileSettings,
  HomeTogetherSettings,
} from '@/types'

type ImageTarget =
  | 'profileAvatar'
  | 'profileBackground'
  | 'togetherLeftAvatar'
  | 'togetherRightAvatar'
  | 'largeImage'
  | 'smallImage'

type TextEditorTarget = 'profile' | 'together' | 'images'

function getTogetherDays(startDate: string) {
  const start = new Date(startDate)
  const startTime = start.getTime()

  if (Number.isNaN(startTime)) return 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)

  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1)
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m7.4 16.2 3.1-3.4 2.4 2.5 1.6-1.8 2.1 2.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.8h.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m5.2 18.8 3.1-.7L18 8.4a2.1 2.1 0 0 0-3-3l-9.7 9.7-.7 3.1.6.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m13.8 6.6 3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.5"
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
        d="M8.5 8.9h7M8.5 11.8h4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5.5 12h12M13.5 7.5 18 12l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="4.8"
        y="5.8"
        width="14.4"
        height="13.4"
        rx="2.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 4.3v3M16 4.3v3M4.8 9.5h14.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HomeWidgets() {
  const {
    settings,
    updateHomeProfile,
    updateHomeTogether,
    updateHomeImages,
  } = useSettingsStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null)
  const [textEditorTarget, setTextEditorTarget] = useState<TextEditorTarget | null>(null)

  const home = settings?.home

  const togetherDays = useMemo(
    () => getTogetherDays(home?.together.startDate ?? '2024-01-01'),
    [home?.together.startDate]
  )

  if (!home) {
    return (
      <div className="glass rounded-[28px] border border-white/10 px-5 py-6">
        <div className="h-5 w-28 animate-pulse rounded-full bg-white/[0.08]" />
      </div>
    )
  }

  async function saveImage(target: ImageTarget, value: string) {
    if (!home) return

    if (target === 'profileAvatar') {
      await updateHomeProfile({ ...home.profile, avatarUrl: value })
      return
    }

    if (target === 'profileBackground') {
      await updateHomeProfile({ ...home.profile, backgroundUrl: value })
      return
    }

    if (target === 'togetherLeftAvatar') {
      await updateHomeTogether({ ...home.together, leftAvatarUrl: value })
      return
    }

    if (target === 'togetherRightAvatar') {
      await updateHomeTogether({ ...home.together, rightAvatarUrl: value })
      return
    }

    if (target === 'largeImage') {
      await updateHomeImages({ ...home.images, largeImageUrl: value })
      return
    }

    if (target === 'smallImage') {
      await updateHomeImages({ ...home.images, smallImageUrl: value })
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !imageTarget) return

    if (!file.type.startsWith('image/')) {
      window.alert('请选择图片文件。')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        void saveImage(imageTarget, result)
      }
    }

    reader.readAsDataURL(file)
  }

  function openFilePicker(target: ImageTarget) {
    setImageTarget(target)
    window.setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* User 主页卡 */}
        <article className="glass relative min-h-[272px] overflow-hidden rounded-[28px] border border-white/10 lg:col-span-7">
          <button
  type="button"
  onClick={() => setImageTarget('profileBackground')}
  className="absolute inset-x-0 top-0 z-[1] h-[146px] overflow-hidden text-left"
  aria-label="更换背景图"
>

            {home.profile.backgroundUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={home.profile.backgroundUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.18),transparent_27%),radial-gradient(circle_at_74%_92%,rgba(255,255,255,0.08),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/5 to-black/45" />
          </button>

          <button
            type="button"
            onClick={() => setTextEditorTarget('profile')}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-mist-text backdrop-blur-md transition-colors hover:bg-black/40"
            aria-label="编辑主页文字"
          >
            <EditIcon className="h-4 w-4" />
          </button>

         <div className="pointer-events-none relative z-10 flex min-h-[272px] flex-col justify-end p-5 pt-[116px]">
  <div className="flex items-end gap-4">
    <button
      type="button"
      onClick={() => setImageTarget('profileAvatar')}
      className="pointer-events-auto group relative h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border border-white/20 bg-white/[0.09] shadow-xl"
      aria-label="更换头像"
    >

                {home.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={home.profile.avatarUrl}
                    alt={home.profile.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-mist-text-secondary">
                    <ImageIcon className="h-7 w-7" />
                  </span>
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                  <EditIcon className="h-5 w-5 text-white" />
                </span>
              </button>

              <button
  type="button"
  onClick={() => setTextEditorTarget('profile')}
  className="pointer-events-auto min-w-0 pb-1 text-left"
>

                <h2 className="truncate text-xl font-light text-mist-text">
                  {home.profile.displayName}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-mist-text-secondary">
                  {home.profile.signature}
                </p>
              </button>
            </div>
          </div>
        </article>

        {/* 在一起天数 */}
        <article className="glass flex min-h-[272px] flex-col justify-between rounded-[28px] border border-white/10 p-5 lg:col-span-5">
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={() => setTextEditorTarget('together')}
              className="text-left text-xs tracking-wide text-mist-text-secondary transition-colors hover:text-mist-text"
            >
              {home.together.title}
            </button>

            <button
              type="button"
              onClick={() => setTextEditorTarget('together')}
              className="text-mist-text-secondary transition-colors hover:text-mist-text"
              aria-label="编辑天数组件"
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTextEditorTarget('together')}
            className="mt-8 text-left"
          >
            <div className="flex items-end gap-2">
              <span className="text-6xl font-light leading-none tracking-[-0.06em] text-mist-text">
                {togetherDays}
              </span>
              <span className="mb-1 text-sm text-mist-text-secondary">天</span>
            </div>

            {home.together.note && (
              <p className="mt-4 text-sm text-mist-text-secondary">
                {home.together.note}
              </p>
            )}
          </button>

          <div className="mt-6 flex items-center">
            <AvatarButton
              imageUrl={home.together.leftAvatarUrl}
              onClick={() => setImageTarget('togetherLeftAvatar')}
            />
            <AvatarButton
              imageUrl={home.together.rightAvatarUrl}
              overlap
              onClick={() => setImageTarget('togetherRightAvatar')}
            />
          </div>
        </article>

        {/* 留言板 */}
        <Link
          href="/home/message-board"
          className="glass group min-h-[196px] rounded-[28px] border border-white/10 p-5 transition-colors hover:bg-white/[0.055] lg:col-span-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-light text-mist-text">留言板</h3>
              <p className="mt-1 text-xs text-mist-text-secondary">
                {home.messageBoard.mode === 'ai' ? 'AI 留言' : '字卡留言'}
              </p>
            </div>

            <MessageIcon className="h-5 w-5 text-mist-text-secondary" />
          </div>

          <div className="mt-7 flex items-end justify-between gap-5">
            <p className="max-w-sm text-sm leading-7 text-mist-text-secondary">
              {home.messageBoard.selectedCharacterId
                ? '离开的时候，也许会有人在这里留下一句话。'
                : '选择一个角色，开始留下属于你们的消息。'}
            </p>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-mist-text-secondary transition-colors group-hover:bg-white/[0.09] group-hover:text-mist-text">
              <ArrowIcon className="h-4 w-4" />
            </span>
          </div>
        </Link>

        <ImageCard
          imageUrl={home.images.largeImageUrl}
          title={home.images.largeTitle}
          onImageClick={() => setImageTarget('largeImage')}
          onTextClick={() => setTextEditorTarget('images')}
          className="lg:col-span-3"
        />

        <ImageCard
          imageUrl={home.images.smallImageUrl}
          title={home.images.smallTitle}
          onImageClick={() => setImageTarget('smallImage')}
          onTextClick={() => setTextEditorTarget('images')}
          className="lg:col-span-3"
        />
      </div>

      {imageTarget && (
        <ImageSourceDialog
          title="图片"
          currentUrl={getCurrentImageValue(imageTarget, home)}
          onClose={() => setImageTarget(null)}
          onChooseFile={() => openFilePicker(imageTarget)}
          onSaveUrl={async (url) => {
            await saveImage(imageTarget, url)
            setImageTarget(null)
          }}
          onRemove={async () => {
            await saveImage(imageTarget, '')
            setImageTarget(null)
          }}
        />
      )}

      {textEditorTarget === 'profile' && (
        <ProfileTextEditor
          profile={home.profile}
          onClose={() => setTextEditorTarget(null)}
          onSave={async (profile) => {
            await updateHomeProfile(profile)
            setTextEditorTarget(null)
          }}
        />
      )}

      {textEditorTarget === 'together' && (
        <TogetherTextEditor
          together={home.together}
          onClose={() => setTextEditorTarget(null)}
          onSave={async (together) => {
            await updateHomeTogether(together)
            setTextEditorTarget(null)
          }}
        />
      )}

      {textEditorTarget === 'images' && (
        <ImagesTextEditor
          images={home.images}
          onClose={() => setTextEditorTarget(null)}
          onSave={async (images) => {
            await updateHomeImages(images)
            setTextEditorTarget(null)
          }}
        />
      )}
    </>
  )
}

function getCurrentImageValue(
  target: ImageTarget,
  home: NonNullable<ReturnType<typeof useSettingsStore.getState>['settings']>['home']
) {
  if (target === 'profileAvatar') return home.profile.avatarUrl
  if (target === 'profileBackground') return home.profile.backgroundUrl
  if (target === 'togetherLeftAvatar') return home.together.leftAvatarUrl
  if (target === 'togetherRightAvatar') return home.together.rightAvatarUrl
  if (target === 'largeImage') return home.images.largeImageUrl
  return home.images.smallImageUrl
}

function AvatarButton({
  imageUrl,
  overlap = false,
  onClick,
}: {
  imageUrl: string
  overlap?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] border border-white/15 bg-white/[0.06] text-mist-text-secondary',
        overlap ? '-ml-3' : '',
      ].join(' ')}
      aria-label="更换图片"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-5 w-5" />
      )}

      <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
        <EditIcon className="h-4 w-4 text-white" />
      </span>
    </button>
  )
}

function ImageCard({
  imageUrl,
  title,
  onImageClick,
  onTextClick,
  className,
}: {
  imageUrl: string
  title: string
  onImageClick: () => void
  onTextClick: () => void
  className?: string
}) {
  return (
    <article
      className={[
        'glass min-h-[196px] overflow-hidden rounded-[28px] border border-white/10',
        className ?? '',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onImageClick}
        className="group block h-[150px] w-full overflow-hidden text-left"
        aria-label="更换图片"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.015))] text-mist-text-secondary">
            <ImageIcon className="h-7 w-7" />
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={onTextClick}
        className="block w-full px-4 py-3 text-left"
      >
        <p className="truncate text-sm text-mist-text-secondary">{title}</p>
      </button>
    </article>
  )
}

function ImageSourceDialog({
  title,
  currentUrl,
  onClose,
  onChooseFile,
  onSaveUrl,
  onRemove,
}: {
  title: string
  currentUrl: string
  onClose: () => void
  onChooseFile: () => void
  onSaveUrl: (url: string) => Promise<void>
  onRemove: () => Promise<void>
}) {
  const [url, setUrl] = useState(currentUrl)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSaveUrl() {
    const normalizedUrl = url.trim()
    if (!normalizedUrl) return

    setIsSaving(true)
    try {
      await onSaveUrl(normalizedUrl)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRemove() {
    setIsSaving(true)
    try {
      await onRemove()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-[28px] border border-white/10 p-5">
        <h2 className="text-lg font-light text-mist-text">{title}</h2>

        <button
          type="button"
          onClick={onChooseFile}
          className="mt-5 flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-mist-text transition-colors hover:bg-white/[0.13]"
        >
          从设备选择
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-mist-text-secondary">或</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <label className="block">
          <span className="text-xs text-mist-text-secondary">URL</span>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-mist-text outline-none placeholder:text-mist-text-secondary/50 focus:border-white/25"
          />
        </label>

        <div className="mt-6 flex items-center justify-between gap-3">
          {currentUrl ? (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={isSaving}
              className="text-sm text-mist-text-secondary transition-colors hover:text-mist-text disabled:opacity-60"
            >
              移除
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2 text-sm text-mist-text-secondary transition-colors hover:text-mist-text"
            >
              取消
            </button>

            <button
              type="button"
              onClick={() => void handleSaveUrl()}
              disabled={!url.trim() || isSaving}
              className="rounded-2xl border border-white/10 bg-white/[0.12] px-4 py-2 text-sm text-mist-text transition-colors hover:bg-white/[0.17] disabled:opacity-50"
            >
              {isSaving ? '保存中' : '使用 URL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileTextEditor({
  profile,
  onClose,
  onSave,
}: {
  profile: HomeProfileSettings
  onClose: () => void
  onSave: (profile: HomeProfileSettings) => Promise<void>
}) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [signature, setSignature] = useState(profile.signature)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave({
        ...profile,
        displayName: displayName.trim() || '我的主页',
        signature: signature.trim(),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal title="编辑主页" onClose={onClose}>
      <div className="space-y-4">
        <TextInput label="名字" value={displayName} onChange={setDisplayName} />
        <TextArea label="签名" value={signature} onChange={setSignature} />
      </div>

      <ModalActions onClose={onClose} onSave={handleSave} isSaving={isSaving} />
    </Modal>
  )
}

function TogetherTextEditor({
  together,
  onClose,
  onSave,
}: {
  together: HomeTogetherSettings
  onClose: () => void
  onSave: (together: HomeTogetherSettings) => Promise<void>
}) {
  const [title, setTitle] = useState(together.title)
  const [startDate, setStartDate] = useState(together.startDate)
  const [note, setNote] = useState(together.note)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave({
        ...together,
        title: title.trim() || '第',
        startDate: startDate.trim() || '2024-01-01',
        note: note.trim(),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal title="编辑天数" onClose={onClose}>
      <div className="space-y-4">
        <TextInput label="标题" value={title} onChange={setTitle} />
        <TextInput label="起始日期" value={startDate} onChange={setStartDate} />
        <TextArea label="短句" value={note} onChange={setNote} />
      </div>

      <ModalActions onClose={onClose} onSave={handleSave} isSaving={isSaving} />
    </Modal>
  )
}

function ImagesTextEditor({
  images,
  onClose,
  onSave,
}: {
  images: HomeImageSettings
  onClose: () => void
  onSave: (images: HomeImageSettings) => Promise<void>
}) {
  const [largeTitle, setLargeTitle] = useState(images.largeTitle)
  const [smallTitle, setSmallTitle] = useState(images.smallTitle)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave({
        ...images,
        largeTitle: largeTitle.trim() || '图片',
        smallTitle: smallTitle.trim() || '图片',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal title="编辑图片标题" onClose={onClose}>
      <div className="space-y-4">
        <TextInput label="大图标题" value={largeTitle} onChange={setLargeTitle} />
        <TextInput label="小图标题" value={smallTitle} onChange={setSmallTitle} />
      </div>

      <ModalActions onClose={onClose} onSave={handleSave} isSaving={isSaving} />
    </Modal>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-[28px] border border-white/10 p-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-light text-mist-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-mist-text-secondary transition-colors hover:text-mist-text"
          >
            关闭
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

function ModalActions({
  onClose,
  onSave,
  isSaving,
}: {
  onClose: () => void
  onSave: () => Promise<void>
  isSaving: boolean
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-2xl px-4 py-2 text-sm text-mist-text-secondary transition-colors hover:text-mist-text"
      >
        取消
      </button>

      <button
        type="button"
        onClick={() => void onSave()}
        disabled={isSaving}
        className="rounded-2xl border border-white/10 bg-white/[0.12] px-4 py-2 text-sm text-mist-text transition-colors hover:bg-white/[0.17] disabled:opacity-60"
      >
        {isSaving ? '保存中' : '保存'}
      </button>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs text-mist-text-secondary">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-mist-text outline-none placeholder:text-mist-text-secondary/50 focus:border-white/25"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs text-mist-text-secondary">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-mist-text outline-none placeholder:text-mist-text-secondary/50 focus:border-white/25"
      />
    </label>
  )
}
