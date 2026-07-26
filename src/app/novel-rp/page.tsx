'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCharactersStore } from '@/lib/stores/characters'

export default function NovelRPPage() {
  const { characters, isLoaded, loadCharacters } = useCharactersStore()

  useEffect(() => {
    if (!isLoaded) {
      void loadCharacters()
    }
  }, [isLoaded, loadCharacters])

  return (
    <main className="min-h-screen p-6 pb-12">
      <header className="mb-6">
        <Link
          href="/"
          className="text-xs text-mist-text-secondary hover:text-mist-text transition-colors"
        >
          ← 返回雾屿
        </Link>

        <div className="mt-5">
          <p className="text-xs tracking-[0.3em] text-mist-text-secondary uppercase">
            Novel RP
          </p>
          <h1 className="text-3xl font-light text-mist-text mt-2">小说 RP</h1>
          <p className="text-sm text-mist-text-secondary mt-2 max-w-2xl leading-6">
            用于长篇、小说感、沉浸式角色扮演。创建消息框时可以选择角色库中已有角色，
            不需要在本 App 内重新创建角色。
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <article className="glass rounded-3xl p-5 lg:col-span-5">
          <h2 className="text-lg text-mist-text font-light">创建长 RP 消息框</h2>
          <p className="text-sm text-mist-text-secondary mt-2 leading-6">
            这里后续会创建小说感 RP 会话。每个会话可以绑定一个或多个现有角色，
            并选择 User 身份、世界观、开场场景与写作风格。
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-mist-text-secondary">模式</p>
              <p className="text-sm text-mist-text mt-1">长 RP / 小说叙事</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-mist-text-secondary">角色来源</p>
              <p className="text-sm text-mist-text mt-1">从现有角色库选择</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-mist-text-secondary">数据隔离</p>
              <p className="text-sm text-mist-text mt-1">
                后续使用 novel RP 独立数据表
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="mt-5 w-full rounded-2xl bg-white/10 text-mist-text py-3 text-sm opacity-60 cursor-not-allowed"
          >
            创建消息框，占位中
          </button>
        </article>

        <article className="glass rounded-3xl p-5 lg:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg text-mist-text font-light">选择角色</h2>
              <p className="text-sm text-mist-text-secondary mt-2">
                当前从角色库读取，不在小说 RP 内新建角色。
              </p>
            </div>

            <Link
              href="/characters"
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-mist-text hover:bg-white/15 transition-colors"
            >
              管理角色
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!isLoaded && (
              <div className="rounded-2xl bg-white/5 p-4 text-sm text-mist-text-secondary">
                正在读取角色库……
              </div>
            )}

            {isLoaded && characters.length === 0 && (
              <div className="rounded-2xl bg-white/5 p-4 text-sm text-mist-text-secondary sm:col-span-2">
                角色库还是空的。请先去“角色”App 创建角色，再回到小说 RP 选择。
              </div>
            )}

            {characters.map((character) => (
              <button
                key={character.id}
                type="button"
                className="rounded-2xl bg-white/5 p-4 text-left hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center text-xl">
                    {character.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '🌙'
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-mist-text truncate">
                      {character.name}
                    </p>
                    <p className="text-xs text-mist-text-secondary mt-1 line-clamp-1">
                      {character.relationship || '可用于长 RP'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-4 glass rounded-3xl p-5">
        <h2 className="text-lg text-mist-text font-light">后续预留能力</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-mist-text">章节 / 场景</p>
            <p className="text-xs text-mist-text-secondary mt-2 leading-5">
              长 RP 可按章节、场景、剧情节点组织。
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-mist-text">User 身份</p>
            <p className="text-xs text-mist-text-secondary mt-2 leading-5">
              RP 模式绑定 User 身份，保持沉浸。
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-mist-text">独立记忆</p>
            <p className="text-xs text-mist-text-secondary mt-2 leading-5">
              按角色、身份与 RP 会话隔离记忆。
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
