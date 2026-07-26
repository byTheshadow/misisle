'use client'

import Link from 'next/link'

export default function TodoPage() {
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
            TodoList
          </p>
          <h1 className="text-3xl font-light text-mist-text mt-2">TodoList</h1>
          <p className="text-sm text-mist-text-secondary mt-2 max-w-2xl leading-6">
            管理日常待办、提醒与生活计划。后续可与角色主动消息、通知系统联动。
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <article className="glass rounded-3xl p-5 lg:col-span-7">
          <h2 className="text-lg text-mist-text font-light">今日待办</h2>

          <div className="mt-5 space-y-3">
            {['写下今天想完成的一件事', '预留通知提醒', '后续支持角色提醒'].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/5 p-4 flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full border border-white/30" />
                  <p className="text-sm text-mist-text-secondary">{item}</p>
                </div>
              )
            )}
          </div>
        </article>

        <article className="glass rounded-3xl p-5 lg:col-span-5">
          <h2 className="text-lg text-mist-text font-light">模块预留</h2>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-mist-text">本地优先</p>
              <p className="text-xs text-mist-text-secondary mt-2">
                后续使用独立 todo 数据表。
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-mist-text">角色提醒</p>
              <p className="text-xs text-mist-text-secondary mt-2">
                可接入短信 App 主动消息与系统通知。
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
