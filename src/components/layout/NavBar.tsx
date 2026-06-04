'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/map', icon: '🗾', label: '地図' },
  { href: '/categories', icon: '🎯', label: 'テーマ' },
  { href: '/leaderboard', icon: '🏆', label: 'ランキング' },
  { href: '/friends', icon: '👥', label: 'フレンド' },
  { href: '/profile', icon: '👤', label: 'プロフィール' },
]

export function NavBar() {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[600] bg-white/95 backdrop-blur border-t border-gray-100 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
