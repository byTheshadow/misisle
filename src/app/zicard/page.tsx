'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { IconPlus, IconSend, IconTrash } from '@/components/icons'
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

  const currentLibraries = useMemo(() => {
    if (!currentSession) return []
    return libraries.filter((library) => currentSession.libraryIds.includes(library.id))
  }, [currentSession, libraries])

  const currentFragments = useMemo(() => {
    if (!currentSession) return []
    return fragments.filter((fragment) => currentSession.libraryIds.includes(fragment.libraryId))
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
    if (!currentSession) return
    if (!input.trim()) return

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
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="字卡"
        backHref="/"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setLibraryOpen(true)}>
              字卡库
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <IconPlus className="w-4 h-4 mr-2" />
              新消息框
            </Button>
          </div>
        }
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-0">
        <aside className="border-r border-mist-border p-4 overflow-auto">
          {sessions.length === 0 ? (
            <Card>
              <p className="text-sm text-mist-text-secondary text-center py-8">
                还没有字卡消息框。
              </p>
              <Button className="w-full mt-2" onClick={() => setCreateOpen(true)}>
                创建第一个消息框
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className={
                    currentSession?.id === session.id
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }
                  onClick={() => void loadSession(session.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={session.avatar} name={session.title} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-mist-text truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-mist-text-secondary truncate mt-1">
                        {session.lastMessage || '还没有消息'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </aside>

        <section className="min-h-0 flex flex-col">
          {!currentSession ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-mist-text-secondary">选择一个消息框，或创建新的字卡连接。</p>
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                  创建消息框
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="h-16 border-b border-mist-border px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={currentSession.avatar} name={currentSession.title} />
                  <div>
                    <div className="text-sm text-mist-text">{currentSession.title}</div>
                    <div className="text-xs text-mist-text-secondary">
                      {currentSession.mode === 'deep_random'
                        ? '深度连接：纯随机'
                        : '辅助连接：关键词 + 随机'}
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="secondary" onClick={() => void handleExport()}>
                  导出
                </Button>
              </div>

              {currentSession.todayStatus && (
                <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist-text-secondary">
                  今日状态：{currentSession.todayStatus.content}
                </div>
              )}

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {visibleMessages.length === 0 && (
                  <div className="text-center text-sm text-mist-text-secondary py-10">
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

                {isTyping && replyingSessionId === currentSession.id && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-2 bg-white/10 text-sm text-mist-text-secondary">
                      {currentSession.typingIndicatorText || '正在输入…'}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-mist-border p-4">
                {quoteTarget && (
                  <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-xs text-mist-text-secondary">引用</div>
                      <div className="truncate text-sm text-mist-text">
                        {quoteTarget.content}
                      </div>
                    </div>
                    <button
                      className="text-xs text-mist-text-secondary hover:text-mist-text"
                      onClick={() => setQuoteTarget(null)}
                    >
                      取消
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="输入一条消息…"
                    rows={2}
                    className="min-h-[44px]"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        void handleSend()
                      }
                    }}
                  />
                  <Button onClick={() => void handleSend()} disabled={!input.trim()}>
                    <IconSend className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
            <h3 className="text-sm text-mist-text mb-3">从角色库选择</h3>

            {characters.length === 0 ? (
              <p className="text-sm text-mist-text-secondary">
                角色库还是空的，也可以先创建一个字卡本地角色。
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-auto">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/[0.08]"
                    onClick={async () => {
                      await createSessionFromCharacter(character)
                      setCreateOpen(false)
                    }}
                  >
                    <Avatar src={character.avatar} name={character.name} />
                    <div className="min-w-0">
                      <div className="text-sm text-mist-text truncate">
                        {character.name}
                      </div>
                      <div className="text-xs text-mist-text-secondary truncate">
                        {character.relationship || character.description || '角色库角色'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="border-t border-mist-border pt-5 space-y-3">
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
              <Button onClick={() => void handleCreateLibrary()} disabled={!newLibraryName.trim()}>
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
              placeholder="例如：我刚刚好像听见你在叫我。"
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
            <h3 className="text-sm text-mist-text mb-3">
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
                    <div className="text-sm text-mist-text">{library.name}</div>
                    <div className="text-xs text-mist-text-secondary mt-1">
                      {library.scope === 'global' ? '通用字卡库' : '角色绑定字卡库'}
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
              <p>{message.content}</p>
              <div className="mt-3 flex gap-2">
                <button className="text-xs rounded-lg bg-white/10 px-3 py-1">
                  留下
                </button>
                <button className="text-xs rounded-lg bg-white/10 px-3 py-1">
                  改一改再留下
                </button>
                <button className="text-xs rounded-lg bg-white/5 px-3 py-1">
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
