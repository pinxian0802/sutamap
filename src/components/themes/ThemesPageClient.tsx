'use client'

import { ThemeCard } from './ThemeCard'
import { useDictionary } from '@/lib/i18n/context'
import { Target } from 'lucide-react'

interface ThemeData {
  id: string
  theme_id: string
  name: string
  description: string | null
  color: string
  icon: string
  total: number
  checked: number
  xpPerCheckin: number
  friends: { userId: string; username: string; checked: number }[]
}

interface Props {
  themes: ThemeData[]
}

export function ThemesPageClient({ themes }: Props) {
  const dict = useDictionary()

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.themes.title}</h1>
        <button className="sm-iconbtn">
          <Target size={18} className="text-sub" />
        </button>
      </div>
      <div className="sm-card">
        <div className="sm-card-title">{dict.themes.collectionProgress}</div>
        {themes.map((theme, i) => (
          <div key={theme.id} style={i === 0 ? { borderTop: 'none' } : undefined}>
            <ThemeCard {...theme} />
          </div>
        ))}
      </div>
    </div>
  )
}
