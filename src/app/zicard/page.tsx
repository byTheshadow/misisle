'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { IconPlus, IconTrash } from '@/components/icons'
import { useCharactersStore } from '@/lib/stores/characters'
import { useZicardStore } from '@/lib/stores/zicard'
import type { ZicardMessage } from '@/types'

export default function ZicardPage() {
  const {
    sessions,
    currentSession,
    messages,
    libraries,
    fragments,
    isLoaded,
    isTyping,
    replyingSessionId,
    loadAll,
    loadSession,
    createSessionFromCharacter,
    createLocalSession,
    createLibrary,
    createTextFragment,
    sendUserMessage,
    deleteMessage,
    addTraceFromMessage,
    addDiaryFromMessage,
    exportSession,
  } = useZicardStore()

  const {
    characters,
    isLoaded: charactersLoaded,
    loadCharacters,
  } = useCharactersStore()

  const [createOpen, setCreateOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [localName, setLocalName] = useState('')
  const [localDescription, setLocalDescription] = useState('')
  const [input, setInput] = useState('')
  const [quoteTarget, setQuoteTarget] = useState<ZicardMessage | null>(null)
  const [newLibraryName, setNewLibraryName] = useState('')
  const [newFragmentText, setNewFragmentText] = useState('')
  const [selectedLibraryId, setSelectedLibraryId] = useState('')

  const messageEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isLoaded) {
      void loadAll()
    }

    if (!charactersLoaded) {
      void loadCharacters()
    }
  }, [isLoaded, charactersLoaded, loadAll, loadCharacters])
  const visibleMessages = useMemo(
    () => messages.filter((message) => !message.deletedAt),
    [messages]
  )

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [visibleMessages.length, isTyping, currentSession?.id])


  const currentLibraries = useMemo(() => {
    if (!currentSession) return []

    return libraries.filter((library) =>
      currentSession.libraryIds.includes(library.id)
    )
  }, [currentSession, libraries])

  const currentFragments = useMemo(() => {
    if (!currentSession) return []

    return fragments.filter((fragment) =>
      currentSession.libraryIds.includes(fragment.libraryId)
    )
  }, [currentSession, fragments])

  async function handleCreateLocalSession() {
    if (!localName.trim()) return

    await createLocalSession({
      name: localName.trim(),
      description: localDescription.trim(),
    })

    setLocalName('')
    setLocalDescription('')
    setCreateOpen(false)
  }

  async function handleSend() {
    if (!currentSession || !input.trim()) return

    const content = input.trim()
    const quoteId = quoteTarget?.id ?? null

    setInput('')
    setQuoteTarget(null)

    await sendUserMessage(currentSession.id, content, quoteId)
  }

  async function handleCreateLibrary() {
    if (!newLibraryName.trim()) return

    const library = await createLibrary({
      name: newLibraryName.trim(),
      description: '',
      characterId: null,
    })

    setNewLibraryName('')
    setSelectedLibraryId(library.id)
  }

  async function handleCreateFragment() {
    if (!selectedLibraryId || !newFragmentText.trim()) return

    await createTextFragment({
      libraryId: selectedLibraryId,
      text: newFragmentText.trim(),
      category: '普通',
      kind: 'text',
    })

    setNewFragmentText('')
  }

  async function handleExport() {
    if (!currentSession) return

    const data = await exportSession(currentSession.id)
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `misisle-zicard-${currentSession.title}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#090909]">
      <PageHeader
        title="字卡"
        backHref="/"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setLibraryOpen(true)}
            >
              字卡库
            </Button>

            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              新消息框
            </Button>
          </div>
        }
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-white/[0.08] bg-black/20 p-3 lg:block">
          {sessions.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm text-mist-text-secondary">
                还没有字卡消息框。
              </p>

              <Button
                className="mt-2 w-full"
                onClick={() => setCreateOpen(true)}
              >
                创建第一个消息框
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const isActive = currentSession?.id === session.id

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => void loadSession(session.id)}
                    className={[
                      'w-full rounded-2xl p-3 text-left transition-colors',
                      isActive
                        ? 'bg-white/[0.12] shadow-sm'
                        : 'hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={session.avatar} name={session.title} />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-mist-text">
                          {session.title}
                        </div>

                        <div className="mt-1 truncate text-xs text-mist-text-secondary">
                          {session.lastMessage || '还没有消息'}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {!currentSession ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="text-center">
                <p className="text-mist-text-secondary">
                  选择一个消息框，或创建新的字卡连接。
                </p>

                <Button
                  className="mt-4"
                  onClick={() => setCreateOpen(true)}
                >
                  创建消息框
                </Button>
              </div>
            </div>
          ) : (
            <>
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-black/20 px-4 backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={currentSession.avatar}
                    name={currentSession.title}
                  />

                  <div className="min-w-0">
                    <div className="truncate text-sm text-mist-text">
                      {currentSession.title}
                    </div>

                    <div className="mt-0.5 text-xs text-mist-text-secondary">
                      {currentSession.mode === 'deep_random'
                        ? '深度连接 · 纯随机'
                        : '辅助连接 · 关键词 + 随机'}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void handleExport()}
                >
                  导出
                </Button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-5 sm:px-6">
                  {currentSession.todayStatus && (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-mist-text-secondary">
                      <span className="mr-2 text-mist-text">今日状态</span>
                      {currentSession.todayStatus.content}
                    </div>
                  )}

                  {visibleMessages.length === 0 && (
                    <div className="py-16 text-center text-sm text-mist-text-secondary">
                      还没有消息。发送一句话，等待字卡回应。
                    </div>
                  )}

                  {visibleMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onQuote={() => setQuoteTarget(message)}
                      onDelete={() => void deleteMessage(message.id)}
                      onTrace={() => void addTraceFromMessage(message.id)}
                      onDiary={() => void addDiaryFromMessage(message.id)}
                    />
                  ))}

                  {isTyping &&
                    replyingSessionId === currentSession.id && (
                      <div className="flex justify-start">
                        <div className="rounded-[18px_18px_18px_4px] bg-white/[0.09] px-4 py-2.5 text-sm text-mist-text-secondary">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
                            <span className="ml-1">
                              {currentSession.typingIndicatorText || '正在输入…'}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}

                  <div ref={messageEndRef} />
                </div>
              </div>

              <WeChatComposer
                value={input}
                quoteTarget={quoteTarget}
                onChange={setInput}
                onCancelQuote={() => setQuoteTarget(null)}
                onSend={() => void handleSend()}
              />
            </>
          )}
        </section>
      </main>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="创建字卡消息框"
      >
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm text-mist-text">从角色库选择</h3>

            {characters.length === 0 ? (
              <p className="text-sm text-mist-text-secondary">
                角色库还是空的，也可以先创建一个字卡本地角色。
              </p>
            ) : (
              <div className="max-h-56 space-y-2 overflow-auto">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/[0.08]"
                    onClick={async () => {
                      await createSessionFromCharacter(character)
                      setCreateOpen(false)
                    }}
                  >
                    <Avatar src={character.avatar} name={character.name} />

                    <div className="min-w-0">
                      <div className="truncate text-sm text-mist-text">
                        {character.name}
                      </div>

                      <div className="truncate text-xs text-mist-text-secondary">
                        {character.relationship ||
                          character.description ||
                          '角色库角色'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 border-t border-mist-border pt-5">
            <h3 className="text-sm text-mist-text">创建字卡本地角色</h3>

            <Input
              label="名称"
              value={localName}
              onChange={(event) => setLocalName(event.target.value)}
              placeholder="例如：雾里的某人"
            />

            <Textarea
              label="附加内容"
              value={localDescription}
              onChange={(event) => setLocalDescription(event.target.value)}
              placeholder="性格、关系、梦角链接等"
              rows={4}
            />

            <Button
              className="w-full"
              onClick={() => void handleCreateLocalSession()}
              disabled={!localName.trim()}
            >
              创建本地角色消息框
            </Button>
          </section>
        </div>
      </Modal>

      <Modal
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="字卡库"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm text-mist-text">创建通用字卡库</h3>

            <div className="flex gap-2">
              <Input
                value={newLibraryName}
                onChange={(event) => setNewLibraryName(event.target.value)}
                placeholder="例如：深夜回声"
              />

              <Button
                onClick={() => void handleCreateLibrary()}
                disabled={!newLibraryName.trim()}
              >
                创建
              </Button>
            </div>
          </section>

          <section className="space-y-3 border-t border-mist-border pt-5">
            <h3 className="text-sm text-mist-text">添加文字字卡</h3>

            <Select
              label="选择字卡库"
              value={selectedLibraryId}
              onChange={(event) => setSelectedLibraryId(event.target.value)}
              options={[
                { value: '', label: '请选择' },
                ...libraries.map((library) => ({
                  value: library.id,
                  label: library.name,
                })),
              ]}
            />

            <Textarea
              label="字卡内容"
              value={newFragmentText}
              onChange={(event) => setNewFragmentText(event.target.value)}
              placeholder="输入一条字卡内容"
              rows={4}
            />

            <Button
              onClick={() => void handleCreateFragment()}
              disabled={!selectedLibraryId || !newFragmentText.trim()}
            >
              添加字卡
            </Button>
          </section>

          <section className="border-t border-mist-border pt-5">
            <h3 className="mb-3 text-sm text-mist-text">
              当前会话可用字卡：{currentFragments.length}
            </h3>

            {currentLibraries.length === 0 ? (
              <p className="text-sm text-mist-text-secondary">
                当前会话还没有绑定字卡库。
              </p>
            ) : (
              <div className="space-y-2">
                {currentLibraries.map((library) => (
                  <div
                    key={library.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="text-sm text-mist-text">
                      {library.name}
                    </div>

                    <div className="mt-1 text-xs text-mist-text-secondary">
                      {library.scope === 'global'
                        ? '通用字卡库'
                        : '角色绑定字卡库'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Modal>
    </div>
  )
}

function WeChatComposer({
  value,
  quoteTarget,
  onChange,
  onCancelQuote,
  onSend,
}: {
  value: string
  quoteTarget: ZicardMessage | null
  onChange: (value: string) => void
  onCancelQuote: () => void
  onSend: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = '0px'
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 42), 112)}px`
  }, [value])

  return (
    <div className="shrink-0 border-t border-black/10 bg-[#202020] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:px-5">
      <div className="mx-auto w-full max-w-4xl">
        {quoteTarget && (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-black/20 px-3 py-2">
            <div className="min-w-0 flex-1 border-l-2 border-[#07c160] pl-2.5">
              <div className="text-[11px] text-white/45">引用消息</div>
              <div className="truncate text-sm text-white/75">
                {quoteTarget.content}
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 px-1 text-xs text-white/45 transition hover:text-white"
              onClick={onCancelQuote}
            >
              取消
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            aria-label="更多功能"
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl font-light leading-none text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            ＋
          </button>

          <div className="min-w-0 flex-1 rounded-md bg-[#f7f7f7] px-3 py-2 shadow-inner">
            <textarea
              ref={textareaRef}
              value={value}
              rows={1}
              placeholder="输入一条消息…"
              className="block max-h-28 min-h-[26px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-[26px] text-[#191919] outline-none placeholder:text-[#999]"
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()

                  if (value.trim()) {
                    onSend()
                  }
                }
              }}
            />
          </div>

          <button
            type="button"
            disabled={!value.trim()}
            onClick={onSend}
            className="mb-0.5 h-10 shrink-0 rounded-md bg-[#07c160] px-4 text-sm font-medium text-white transition hover:bg-[#06ad56] disabled:cursor-not-allowed disabled:bg-[#4d755d] disabled:text-white/45"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  onQuote,
  onDelete,
  onTrace,
  onDiary,
}: {
  message: ZicardMessage
  onQuote: () => void
  onDelete: () => void
  onTrace: () => void
  onDiary: () => void
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
              ? 'rounded-[18px_18px_4px_18px] bg-[#1f6b47] px-4 py-2.5 text-mist-text'
              : 'rounded-[18px_18px_18px_4px] bg-white/[0.1] px-4 py-2.5 text-mist-text'
          }
        >
          {message.type === 'image-card' ? (
            <FlippableImageCard message={message} />
          ) : message.type === 'voice-card' ? (
            <VoiceCard message={message} />
          ) : message.type === 'zicard-request' ? (
            <div>
              <p>{message.content}</p>

              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-white/10 px-3 py-1 text-xs">
                  留下
                </button>
                <button className="rounded-lg bg-white/10 px-3 py-1 text-xs">
                  改一改再留下
                </button>
                <button className="rounded-lg bg-white/5 px-3 py-1 text-xs">
                  不用
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-6">
              {message.content}
            </p>
          )}
        </div>

        <div className="mt-1 hidden gap-2 text-[11px] text-mist-text-secondary group-hover:flex">
          <button onClick={onQuote} className="hover:text-mist-text">
            引用
          </button>
          <button onClick={onTrace} className="hover:text-mist-text">
            留痕
          </button>
          <button onClick={onDiary} className="hover:text-mist-text">
            生成日记
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1 hover:text-red-300"
          >
            <IconTrash className="h-3 w-3" />
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
      className="flex h-28 w-40 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm"
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
