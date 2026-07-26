'use client'

import { useMemo } from 'react'

function getTogetherDays(startDate: string) {
  const start = new Date(startDate).getTime()
  const now = Date.now()

  if (Number.isNaN(start)) return 0

  const diff = now - start
  return Math.max(1, Math.floor(diff / 86_400_000) + 1)
}

export function HomeWidgets() {
  const togetherDays = useMemo(() => getTogetherDays('2024-01-01'), [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* User 主页卡 */}
      <article className="glass rounded-3xl overflow-hidden lg:col-span-7 min-h-[220px]">
        <div
          className="h-28 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04)), url("")',
          }}
        />

        <div className="p-5 -mt-8">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl shadow-lg">
              🫧
            </div>

            <div className="pb-1">
              <h2 className="text-xl text-mist-text font-light">我的主页</h2>
              <p className="text-sm text-mist-text-secondary mt-1">
                今天也在雾里慢慢生活。
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-xs text-mist-text-secondary">头像</p>
              <p className="text-sm text-mist-text mt-1">可编辑</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-xs text-mist-text-secondary">背景图</p>
              <p className="text-sm text-mist-text mt-1">可编辑</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-xs text-mist-text-secondary">签名</p>
              <p className="text-sm text-mist-text mt-1">可编辑</p>
            </div>
          </div>
        </div>
      </article>

      {/* 在一起天数卡 */}
      <article className="glass rounded-3xl p-5 lg:col-span-5 min-h-[220px] flex flex-col justify-between">
        <div>
          <p className="text-xs text-mist-text-secondary">在一起的第</p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-5xl font-light text-mist-text">
              {togetherDays}
            </span>
            <span className="text-sm text-mist-text-secondary mb-2">天</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex -space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl">
              🫧
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl">
              🌙
            </div>
          </div>

          <p className="text-xs text-mist-text-secondary text-right leading-5">
            美化组件
            <br />
            不绑定真实关系
          </p>
        </div>
      </article>

      {/* AI 留言板 */}
      <article className="glass rounded-3xl p-5 lg:col-span-6 min-h-[180px]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base text-mist-text font-light">AI 留言板</h3>
            <p className="text-xs text-mist-text-secondary mt-1">
              根据离开时间生成，支持 AI 生成 / 仅字卡。
            </p>
          </div>
          <span className="text-2xl">✉️</span>
        </div>

        <div className="mt-5 rounded-2xl bg-white/5 p-4">
          <p className="text-sm text-mist-text leading-6">
            “你不在的时候，这里会留下一些轻轻的声音。”
          </p>
          <p className="text-xs text-mist-text-secondary mt-3">
            后续可选择角色、留言来源与生成规则。
          </p>
        </div>
      </article>

      {/* 大图 URL 卡 */}
      <article className="glass rounded-3xl overflow-hidden lg:col-span-3 min-h-[180px]">
        <div className="h-28 bg-white/5 flex items-center justify-center text-3xl">
          🖼️
        </div>
        <div className="p-4">
          <h3 className="text-sm text-mist-text">大图 URL</h3>
          <p className="text-xs text-mist-text-secondary mt-1">
            用于首页氛围图展示。
          </p>
        </div>
      </article>

      {/* 小图 URL 卡 */}
      <article className="glass rounded-3xl p-4 lg:col-span-3 min-h-[180px] flex flex-col justify-between">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
          🌌
        </div>
        <div>
          <h3 className="text-sm text-mist-text">小图 URL</h3>
          <p className="text-xs text-mist-text-secondary mt-1">
            可放置头像、贴纸、小挂件。
          </p>
        </div>
      </article>
    </div>
  )
}
