'use client'

import { useState, useRef, useEffect } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { TitleSelector } from './TitleSelector'
import { CategoryProgressList } from './CategoryProgressList'
import { EditProfileModal } from './EditProfileModal'
import { useDictionary } from '@/lib/i18n/context'
import { Settings } from 'lucide-react'

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
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4 space-y-[13px]">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.profile.status}</h1>
        <div className="relative" ref={dropdownRef}>
          <button className="sm-iconbtn" onClick={() => setShowDropdown(v => !v)}>
            <Settings size={16} className="text-sub" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-paper border border-line rounded-[11px] shadow-md py-1 min-w-[140px] z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-paper2 transition-colors rounded-[10px]"
                onClick={() => { setShowDropdown(false); setShowEdit(true) }}
              >
                {dict.profile.edit}
              </button>
            </div>
          )}
        </div>
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
