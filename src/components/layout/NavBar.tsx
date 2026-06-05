'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDictionary } from '@/lib/i18n/context'
import { Map, Target, Trophy, Users, User } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'

const ICON_MAP = { map: Map, categories: Target, leaderboard: Trophy, friends: Users, profile: User }

export function NavBar() {
  const pathname = usePathname()
  const dict = useDictionary()

  const NAV_ITEMS = [
    { href: '/map', key: 'map' as const, label: dict.nav.map },
    { href: '/categories', key: 'categories' as const, label: dict.nav.categories },
    { href: '/leaderboard', key: 'leaderboard' as const, label: dict.nav.leaderboard },
    { href: '/friends', key: 'friends' as const, label: dict.nav.friends },
    { href: '/profile', key: 'profile' as const, label: dict.nav.profile },
  ]

  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) return null

  return (
    <nav className="sm-nav">
      <div className="absolute -top-9 right-3">
        <LanguageSwitcher />
      </div>
      {NAV_ITEMS.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = ICON_MAP[item.key]
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-[3px] py-1 px-2 relative"
          >
            {isActive && (
              <span className="absolute -top-[9px] w-[5px] h-[5px] rounded-full bg-green" />
            )}
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.9}
              className={isActive ? 'text-green-d' : 'text-faint'}
            />
            <span
              className={`text-[10px] font-bold ${isActive ? 'text-green-d' : 'text-faint'}`}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
