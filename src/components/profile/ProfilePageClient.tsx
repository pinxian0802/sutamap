'use client'

import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { TitleSelector } from './TitleSelector'
import { ThemeProgressList } from './ThemeProgressList'
import { EditProfileModal } from './EditProfileModal'
import { LanguageModal } from './LanguageModal'
import { useDictionary } from '@/lib/i18n/context'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Settings } from 'lucide-react'

interface Props {
  profile: any
  earnedTitles: any[]
  themeProgress: any[]
  totalCheckins: number
  totalSpots: number
}

export function ProfilePageClient({ profile, earnedTitles, themeProgress, totalCheckins, totalSpots }: Props) {
  const dict = useDictionary()
  const [showEdit, setShowEdit] = useState(false)
  const [showLanguage, setShowLanguage] = useState(false)

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4 space-y-[13px]">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.profile.status}</h1>
        <Dropdown trigger={<button className="sm-iconbtn"><Settings size={16} className="text-sub" /></button>}>
          <DropdownItem onClick={() => setShowEdit(true)}>{dict.profile.edit}</DropdownItem>
          <DropdownItem onClick={() => setShowLanguage(true)}>{dict.profile.language}</DropdownItem>
        </Dropdown>
      </div>
      <ProfileHeader
        username={profile?.username ?? ''}
        userCode={profile?.user_code ?? undefined}
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
      <ThemeProgressList themes={themeProgress} />
      {showEdit && (
        <EditProfileModal
          userId={profile?.id}
          currentUsername={profile?.username ?? ''}
          currentAvatarUrl={profile?.avatar_url ?? null}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showLanguage && (
        <LanguageModal onClose={() => setShowLanguage(false)} />
      )}
    </div>
  )
}
