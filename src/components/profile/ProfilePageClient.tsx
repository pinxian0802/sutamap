'use client'

import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { TitleSelector } from './TitleSelector'
import { CategoryProgressList } from './CategoryProgressList'
import { EditProfileModal } from './EditProfileModal'
import { useDictionary } from '@/lib/i18n/context'
import { Pencil } from 'lucide-react'

interface Props {
  profile: any
  earnedTitles: any[]
  categoryProgress: any[]
  totalCheckins: number
  totalSpots: number
}

export function ProfilePageClient({ profile, earnedTitles, categoryProgress, totalCheckins, totalSpots }: Props) {
  const dict = useDictionary()
  const [showEdit, setShowEdit] = useState(false)

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4 space-y-[13px]">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.profile.status}</h1>
        <button className="sm-iconbtn" onClick={() => setShowEdit(true)}>
          <Pencil size={16} className="text-sub" />
        </button>
      </div>
      <ProfileHeader
        username={profile?.username ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
        totalXp={profile?.total_xp ?? 0}
        level={profile?.level ?? 1}
        activeTitle={profile?.titles?.name}
        totalCheckins={totalCheckins}
        totalTitles={earnedTitles.length}
        totalSpots={totalSpots}
      />
      <TitleSelector
        earnedTitles={earnedTitles}
        activeTitleId={profile?.active_title_id ?? null}
      />
      <CategoryProgressList categories={categoryProgress} />
      {showEdit && (
        <EditProfileModal
          userId={profile?.id}
          currentUsername={profile?.username ?? ''}
          currentAvatarUrl={profile?.avatar_url ?? null}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
