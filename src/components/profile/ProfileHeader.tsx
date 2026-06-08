'use client'

import { xpToNextLevel } from '@/lib/xp/calculator'
import { useDictionary } from '@/lib/i18n/context'
import { UserAvatar } from './UserAvatar'

interface Props {
  username: string
  userCode?: string
  avatarUrl?: string | null
  totalXp: number
  level: number
  activeTitle?: string | null
  totalCheckins?: number
  totalTitles?: number
  rank?: number
  totalSpots?: number
}

export function ProfileHeader({ username, userCode, avatarUrl, totalXp, level, activeTitle, totalCheckins = 0, totalTitles = 0, rank, totalSpots = 0 }: Props) {
  const { current, needed } = xpToNextLevel(totalXp)
  const xpPct = Math.round((current / needed) * 100)
  const completionPct = totalSpots > 0 ? Math.round((totalCheckins / totalSpots) * 100) : 0
  const dict = useDictionary()

  return (
    <div className="sm-card">
      <div className="sm-card-title">{dict.profile.status}</div>
      <div className="flex gap-[14px]">
        <UserAvatar
          username={username}
          avatarUrl={avatarUrl}
          size={74}
          rounded="rounded"
          className="h-[88px]"
        />
        <div className="flex-1">
          <div className="flex justify-between text-[13px] py-[2px]">
            <span className="text-sub">{dict.profile.name}</span>
            <span>{username}</span>
          </div>
          {userCode && (
            <div className="flex justify-between text-[13px] py-[2px]">
              <span className="text-sub">{dict.profile.userCode}</span>
              <span className="sm-mono text-sub">#{userCode}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px] py-[2px]">
            <span className="text-sub">{dict.profile.level}</span>
            <span className="sm-mono">{level}</span>
          </div>
          <div className="mt-[9px]">
            <div className="flex justify-between text-[11px] mb-[5px]">
              <span className="text-amber font-bold">{dict.profile.exp}</span>
              <span className="sm-mono text-sub">{current} / {needed}</span>
            </div>
            <div className="sm-pbar" style={{ height: 7 }}>
              <div className="sm-pfill" style={{ width: `${xpPct}%`, background: 'var(--amber)' }} />
            </div>
            <div className="flex justify-between text-[11px] mt-[9px] mb-[5px]">
              <span className="text-green-d font-bold">{dict.profile.completionRate}</span>
              <span className="sm-mono text-sub">{totalCheckins} / {totalSpots}</span>
            </div>
            <div className="sm-pbar" style={{ height: 7 }}>
              <div className="sm-pfill" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-[15px] pt-[13px] border-t border-line2">
        <StatTile v={totalCheckins} k={dict.profile.checkins} />
        <div className="w-px bg-line2" />
        <StatTile v={totalTitles} k={dict.profile.titles} color="var(--terra)" />
        <div className="w-px bg-line2" />
        <StatTile v={rank ? `#${rank}` : '—'} k={dict.profile.globalRank} color="var(--green-d)" />
      </div>
    </div>
  )
}

function StatTile({ v, k, color }: { v: number | string; k: string; color?: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-[23px] font-bold" style={{ fontFamily: 'var(--font-display)', color: color || 'var(--ink)' }}>
        {v}
      </div>
      <div className="text-[10.5px] text-sub mt-[3px] font-bold tracking-[0.06em]">{k}</div>
    </div>
  )
}
