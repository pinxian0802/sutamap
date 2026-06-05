'use client'

import { ProfileHeader } from './ProfileHeader'
import { BadgeWall } from './BadgeWall'
import { TitleSelector } from './TitleSelector'
import { CategoryProgressList } from './CategoryProgressList'
import { useDictionary } from '@/lib/i18n/context'
import { Settings } from 'lucide-react'

interface Props {
  profile: any
  earnedBadges: any[]
  allBadges: any[]
  earnedTitles: any[]
  categoryProgress: any[]
  totalCheckins: number
  totalSpots: number
}

export function ProfilePageClient({ profile, earnedBadges, allBadges, earnedTitles, categoryProgress, totalCheckins, totalSpots }: Props) {
  const dict = useDictionary()

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4 space-y-[13px]">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.profile.status}</h1>
        <button className="sm-iconbtn">
          <Settings size={18} className="text-sub" />
        </button>
      </div>
      <ProfileHeader
        username={profile?.username ?? ''}
        totalXp={profile?.total_xp ?? 0}
        level={profile?.level ?? 1}
        activeTitle={profile?.titles?.name}
        totalCheckins={totalCheckins}
        totalBadges={earnedBadges.length}
        totalSpots={totalSpots}
      />
      <TitleSelector
        earnedTitles={earnedTitles}
        activeTitleId={profile?.active_title_id ?? null}
      />
      <CategoryProgressList categories={categoryProgress} />
      <BadgeWall earnedBadges={earnedBadges} allBadges={allBadges} />
    </div>
  )
}
