'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCharactersStore } from '@/lib/stores/characters'
import { useSettingsStore } from '@/lib/stores/settings'

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M18.5 12h-13M10.5 7 5.5 12l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m6.8 12.2 3.2 3.2 7.2-7.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CharacterPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.8 19c.8-3.1 3.1-4.7 6.2-4.7s5.4 1.6 6.2 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function MessageBoardSettingsPage() {
  const {
    settings,
    isLoaded: isSettingsLoaded,
    loadSettings,
    updateHomeMessageBoard,
  } = useSettingsStore()

  const {
    characters,
    isLoaded: isCharactersLoaded,
    loadCharacters,
  } = useCharactersStore()

  const [draftMode, setDraftMode] = useState<'ai' | 'zicard'>('ai')
  const [draftCharacterId, setDraftCharacterId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isSettingsLoaded) {
      void loadSettings()
    }

    if (!isCharactersLoaded) {
      void loadCharacters()
    }
  }, [isSettingsLoaded, isCharactersLoaded, loadSettings, loadCharacters])

  useEffect(() => {
    if (!settings?.home.messageBoard) return

    setDraftMode(settings.home.messageBoard.mode)
    setDraftCharacterId(settings.home.messageBoard.selectedCharacterId)
  }, [settings?.home.messageBoard])

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === draftCharacterId),
    [characters, draftCharacterId]
  )

  async function handleSave() {
    setIsSaving(true)

    try {
      await updateHomeMessageBoard({
        mode: draftMode,
        selectedCharacterId: draftCharacterId,
        lastSeenAt: Date.now(),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-mist-text-secondary transition-colors hover:text-mist-text"
        >
          <BackIcon className="h-4 w-4" />
          返回首页
        </Link>

        <div className="mt-7">
          <p className="text-[11px] uppercase tracking-[0.3em] text-mist-text-secondary">
            Message Board
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-mist-text">
            留言板
          </h1>
        </div>
      </header>

      <div className="grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="glass rounded-[28px] border border-white/10 p-5 lg:col-span-7">
          <h2 className="text-base font-light text-mist-text">留言方式</h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <ModeOption
              active={draftMode === 'ai'}
              title="AI 留言"
              description="由角色生成新的留言。"
              onClick={() => setDraftMode('ai')}
            />

            <ModeOption
              active={draftMode === 'zicard'}
              title="字卡留言"
              description="从该角色的字卡内容中抽取。"
              onClick={() => setDraftMode('zicard')}
            />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-base font-light text-mist-text">选择角色</h2>

            <Link
              href="/characters"
              className="text-xs text-mist-text-secondary transition-colors hover:text-mist-text"
            >
              角色库
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {!isCharactersLoaded && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-5 text-sm text-mist-text-secondary sm:col-span-2">
                正在读取角色库……
              </div>
            )}

            {isCharactersLoaded && characters.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-5 text-sm text-mist-text-secondary sm:col-span-2">
                角色库还是空的。
              </div>
            )}

            {characters.map((character) => {
              const isSelected = character.id === draftCharacterId

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => setDraftCharacterId(character.id)}
                  className={[
                    'relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-white/30 bg-white/[0.1]'
                      : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]',
                  ].join(' ')}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white/[0.06] text-mist-text-secondary">
                    {character.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <CharacterPlaceholderIcon className="h-5 w-5" />
                    )}
                  </div>

                  <span className="min-w-0">
                    <span className="block truncate text-sm text-mist-text">
                      {character.name}
                    </span>
                    {character.relationship && (
                      <span className="mt-1 block truncate text-xs text-mist-text-secondary">
                        {character.relationship}
                      </span>
                    )}
                  </span>

                  {isSelected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <aside className="glass flex min-h-[260px] flex-col justify-between rounded-[28px] border border-white/10 p-5 lg:col-span-5">
          <div>
            <p className="text-xs text-mist-text-secondary">当前选择</p>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.05] text-mist-text-secondary">
                {selectedCharacter?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedCharacter.avatar}
                    alt={selectedCharacter.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CharacterPlaceholderIcon className="h-6 w-6" />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base text-mist-text">
                  {selectedCharacter?.name ?? '尚未选择角色'}
                </p>
                <p className="mt-1 text-sm text-mist-text-secondary">
                  {draftMode === 'ai' ? 'AI 留言' : '字卡留言'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!draftCharacterId || isSaving}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.13] px-4 py-3 text-sm text-mist-text transition-colors hover:bg-white/[0.18] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving ? '保存中' : '保存'}
            </button>

            <Link
              href="/"
              className="mt-3 block text-center text-sm text-mist-text-secondary transition-colors hover:text-mist-text"
            >
              返回首页
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}

function ModeOption({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-2xl border p-4 text-left transition-colors',
        active
          ? 'border-white/30 bg-white/[0.1]'
          : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]',
      ].join(' ')}
    >
      <p className="text-sm text-mist-text">{title}</p>
      <p className="mt-2 text-xs leading-5 text-mist-text-secondary">
        {description}
      </p>
    </button>
  )
}
