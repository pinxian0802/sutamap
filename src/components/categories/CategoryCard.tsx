'use client'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { useDictionary } from '@/lib/i18n/context'

interface Friend {
  userId: string
  username: string
  checked: number
}

interface Props {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  total: number
  checked: number
  xpPerCheckin: number
  friends: Friend[]
}

export function CategoryCard({ id, name, description, color, icon, total, checked, xpPerCheckin, friends }: Props) {
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  const isComplete = checked === total && total > 0
  const dict = useDictionary()

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isComplete ? 'ring-2 ring-amber-400' : ''}`}>
      <div className="h-1.5" style={{ background: color }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-bold text-sm">{name}</h3>
              {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {isComplete && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{dict.categories.complete}</span>}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{checked} / {total} {dict.categories.spots}</span>
            <span>{xpPerCheckin} {dict.categories.xpPerSpot}</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {friends.length > 0 && (
          <div className="border-t pt-2">
            <p className="text-xs text-gray-400 mb-1.5">{dict.categories.friendsWorking}</p>
            <div className="flex gap-2 flex-wrap">
              {friends.map(f => (
                <Link key={f.userId} href={`/profile/${f.userId}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                    {f.username[0].toUpperCase()}
                  </div>
                  <span>{f.username}</span>
                  <span className="text-gray-400">({f.checked})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
