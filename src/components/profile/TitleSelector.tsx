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
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{dict.profile.titles}</h2>
      <div className="space-y-2">
        {earnedTitles.map(title => (
          <button
            key={title.id}
            onClick={() => handleSelect(title.id)}
            disabled={isPending}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
              selected === title.id
                ? 'border-amber-400 bg-amber-50'
                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{title.name}</span>
              {selected === title.id && <span className="text-xs text-amber-600">{dict.profile.active}</span>}
            </div>
            {title.description && (
              <p className="text-xs text-gray-500 mt-0.5">{title.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
