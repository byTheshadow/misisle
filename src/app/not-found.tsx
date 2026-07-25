// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl text-mist-text mb-2">页面不存在</h1>
      <p className="text-mist-text-secondary mb-6">你访问的页面没有找到。</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg glass text-mist-text hover:bg-white/5 transition-colors"
      >
        返回主页
      </Link>
    </main>
  )
}
