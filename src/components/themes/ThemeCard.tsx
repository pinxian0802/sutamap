'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/lib/i18n/context'

interface Friend {
  userId: string
  username: string
  checked: number
}

interface Props {
  id: string
  theme_id: string
  name: string
  description: string | null
  color: string
  icon: string
  total: number
  checked: number
  xpPerCheckin: number
  friends: Friend[]
}

export function ThemeCard({ theme_id, name, color, icon, total, checked, xpPerCheckin, friends }: Props) {
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  const isComplete = checked === total && total > 0
  const dict = useDictionary()
  const router = useRouter()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/themes/${theme_id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/themes/${theme_id}`) } }}
      className="py-[9px] cursor-pointer"
      style={{ borderTop: '1px solid var(--line2)' }}
    >
      <div className="flex items-center gap-[9px]">
        <span
          className="w-[26px] h-[26px] rounded-lg text-white grid place-items-center flex-shrink-0 text-[15px]"
          style={{ background: color }}
        >
          {icon}
        </span>
        <span className="flex-1 font-bold text-[14px]">{name}</span>
        <span
          className="sm-mono text-[12px] font-bold"
          style={{ color: isComplete ? 'var(--green-d)' : 'var(--sub)' }}
        >
          {isComplete ? dict.themes.complete : `${checked}/${total}`}
        </span>
      </div>
      <div className="mt-2">
        <div className="sm-pbar" style={{ height: 6 }}>
          <div className="sm-pfill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      {friends.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            {friends.slice(0, 3).map(f => (
              <Link
                key={f.userId}
                href={`/profile/${f.userId}`}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded-full bg-ink2 text-white text-[9px] font-bold grid place-items-center border border-paper"
              >
                {f.username[0]?.toUpperCase()}
              </Link>
            ))}
          </div>
          <span className="text-[10.5px] text-sub">{dict.themes.friendsWorking}</span>
        </div>
      )}
    </div>
  )
}
