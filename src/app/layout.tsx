// src/app/layout.tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'

const basePath = process.env.NODE_ENV === 'production' ? '/misisle' : ''

export const metadata: Metadata = {
  title: '雾屿 Misisle',
  description: 'AI 角色陪伴生态系统',
  manifest: `${basePath}/manifest.json`,
  themeColor: '#0a0a0a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

