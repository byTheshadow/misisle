'use client'

import Link from 'next/link'

export default function VocabPage() {
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
            Vocabulary
          </p>
          <h1 className="text-3xl font-light text-mist-text mt-2">背单词</h1>
          <p className="text-sm text-mist-text-secondary mt-2 max-w-2xl leading-6">
            单词卡片系统。后续支持角色在聊天中提醒背单词、多语言对话与释义卡片。
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <article className="glass rounded-3xl p-5 lg:col-span-7 min-h-[300px]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg text-mist-text font-light">今日词卡</h2>
              <p className="text-sm text-mist-text-secondary mt-2">
                单词学习卡片，占位中。
              </p>
            </div>
            <span className="text-3xl">📝</span>
          </div>

          <div className="mt-8 rounded-3xl bg-white/5 p-6">
            <p className="text-xs text-mist-text-secondary">Word</p>
            <h3 className="text-4xl text-mist-text font-light mt-3">mistral</h3>
            <p className="text-sm text-mist-text-secondary mt-4 leading-6">
              n. 密史脱拉风；寒冷而干燥的北风。这里作为占位词卡示例。
            </p>
          </div>
        </article>

        <article className="glass rounded-3xl p-5 lg:col-span-5">
          <h2 className="text-lg text-mist-text font-light">陪伴式学习</h2>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-mist-text">聊天中提醒背单词</p>
              <p className="text-xs text-mist-text-secondary mt-2">
                后续作为可开关项接入角色聊天。
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-mist-text">多语言对话</p>
              <p className="text-xs text-mist-text-secondary mt-2">
                角色可以在对话中自然插入目标语言。
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-mist-text">释义卡片</p>
              <p className="text-xs text-mist-text-secondary mt-2">
                点击单词后显示释义、例句、熟悉度。
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
