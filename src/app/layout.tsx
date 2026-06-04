import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { NavBar } from '@/components/layout/NavBar'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'sutamap',
  description: '日本各地を巡るスタンプラリーゲーム',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1a2e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geist.className} pb-16`}>
        {children}
        <NavBar />
      </body>
    </html>
  )
}
