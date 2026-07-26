'use client'

import Link from 'next/link'

export default function TarotPage() {
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
            Tarot & Lenormand
          </p>
          <h1 className="text-3xl font-light text-mist-text mt-2">塔罗占卜</h1>
          <p className="text-sm text-mist-text-secondary mt-2 max-w-2xl leading-6">
            支持塔罗牌、雷诺曼与牌阵。默认提供兜底牌意解释，后续可选择 AI 解读。
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="glass rounded-3xl p-5">
          <div className="text-3xl mb-4">🔮</div>
          <h2 className="text-lg text-mist-text font-light">塔罗牌</h2>
          <p className="text-sm text-mist-text-secondary mt-2 leading-6">
            预留标准塔罗牌组、正逆位、单张牌与多张牌阵。
          </p>
        </article>

        <article className="glass rounded-3xl p-5">
          <div className="text-3xl mb-4">🃏</div>
          <h2 className="text-lg text-mist-text font-light">雷诺曼</h2>
          <p className="text-sm text-mist-text-secondary mt-2 leading-6">
            预留雷诺曼牌组与组合解释。
          </p>
        </article>

        <article className="glass rounded-3xl p-5">
          <div className="text-3xl mb-4">✨</div>
          <h2 className="text-lg text-mist-text font-light">AI 解读</h2>
          <p className="text-sm text-mist-text-secondary mt-2 leading-6">
            默认先展示本地牌意，用户可点击按钮生成 AI 解读。
          </p>
        </article>
      </section>

      <section className="mt-4 glass rounded-3xl p-5">
        <h2 className="text-lg text-mist-text font-light">牌阵，占位中</h2>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {['单张牌', '三张牌', '关系牌阵'].map((name) => (
            <button
              key={name}
              type="button"
              disabled
              className="rounded-2xl bg-white/5 p-4 text-left opacity-70 cursor-not-allowed"
            >
              <p className="text-sm text-mist-text">{name}</p>
              <p className="text-xs text-mist-text-secondary mt-2">
                后续开放抽牌与解释。
              </p>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
