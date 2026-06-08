'use client'

import Link from 'next/link'
import { useDictionary } from '@/lib/i18n/context'
import { UserAvatar } from '@/components/profile/UserAvatar'
import { Check, MapPin, Medal, ChevronRight } from 'lucide-react'

interface Props {
  friendshipId: string
  userId: string
  username: string
  level: number
  avatarUrl?: string | null
  status: 'pending' | 'accepted' | 'rejected'
  isRequester: boolean
  color?: string
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onRemove: (id: string) => void
}

export function FriendCard({ friendshipId, userId, username, level, avatarUrl, status, isRequester, color = '#8fa6bd', onAccept, onReject, onRemove }: Props) {
  const dict = useDictionary()

  if (status === 'pending') {
    return (
      <div className="sm-card flex items-center gap-3">
        <UserAvatar username={username} avatarUrl={avatarUrl} size={46} rounded="full" />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold">{username}</div>
          <div className="text-[11.5px] text-sub">Lv {level}</div>
        </div>
        {!isRequester ? (
          <>
            <button
              onClick={() => onAccept(friendshipId)}
              className="sm-iconbtn"
              style={{ width: 38, height: 38, background: 'var(--green)', border: 'none', color: '#fff' }}
            >
              <Check size={18} strokeWidth={2.6} />
            </button>
            <button onClick={() => onReject(friendshipId)} className="sm-iconbtn" style={{ width: 38, height: 38 }}>
              <span className="text-[20px] leading-none text-sub">×</span>
            </button>
          </>
        ) : (
          <span className="text-xs text-faint px-2">{dict.friends.pending}</span>
        )}
      </div>
    )
  }

  return (
    <div className="sm-card flex items-center gap-[13px]">
      <Link href={`/profile/${userId}?from=friends`} className="flex items-center gap-[13px] flex-1 min-w-0">
        <UserAvatar username={username} avatarUrl={avatarUrl} size={50} rounded="rounded" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15.5px] font-bold">{username}</span>
            <span className="sm-mono text-[11px] text-white px-2 py-[1px] rounded-[7px] bg-ink2">
              Lv {level}
            </span>
          </div>
          <div className="text-[11.5px] text-sub mt-1 flex gap-3">
            <span className="sm-mono inline-flex items-center gap-0.5">
              <MapPin size={12} strokeWidth={2} className="text-sub" />—
            </span>
            <span className="sm-mono inline-flex items-center gap-0.5">
              <Medal size={12} strokeWidth={2} className="text-sub" />—
            </span>
          </div>
        </div>
        <ChevronRight size={18} className="text-faint" />
      </Link>
      {/* <button onClick={() => onRemove(friendshipId)} className="sm-iconbtn" style={{ width: 38, height: 38 }}>
        <span className="text-[20px] leading-none text-sub">×</span>
      </button> */}
    </div>
  )
}
