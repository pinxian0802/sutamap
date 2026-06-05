'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/lib/i18n/context'

interface Title {
  id: string
  name: string
  description: string | null
}

interface Props {
  earnedTitles: Title[]
  activeTitleId: string | null
}

export function TitleSelector({ earnedTitles, activeTitleId }: Props) {
  const [selected, setSelected] = useState(activeTitleId)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const dict = useDictionary()

  async function handleSelect(titleId: string) {
    const newId = titleId === selected ? null : titleId
    setSelected(newId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase as any)
      .from('user_profiles')
      .update({ active_title_id: newId })
      .eq('id', user.id)
    startTransition(() => router.refresh())
  }

  if (earnedTitles.length === 0) return null

  return (
    <div className="sm-card">
      <div className="sm-card-title">{dict.profile.titlesLabel}</div>
      {earnedTitles.map(title => {
        const on = selected === title.id
        return (
          <button
            key={title.id}
            onClick={() => handleSelect(title.id)}
            disabled={isPending}
            className="flex items-center gap-[9px] w-full text-left px-1 py-[9px] rounded-[9px] cursor-pointer transition-colors"
            style={{ background: on ? 'var(--tint)' : 'transparent' }}
          >
            <span className="w-[14px] text-green" style={{ opacity: on ? 1 : 0 }}>▶</span>
            <span className="flex-1 text-[14px]" style={{ fontWeight: on ? 700 : 400, color: on ? 'var(--ink)' : 'var(--sub)' }}>
              {title.name}
            </span>
            {title.description && (
              <span className="text-[10.5px] text-sub">{title.description}</span>
            )}
            <span
              className="text-[11px] font-bold px-[9px] py-[2px] rounded-[7px]"
              style={{
                color: on ? 'var(--green-d)' : 'var(--faint)',
                background: on ? 'var(--tint2)' : 'var(--paper2)',
              }}
            >
              {on ? dict.profile.active : dict.profile.inactive}
            </span>
          </button>
        )
      })}
    </div>
  )
}
