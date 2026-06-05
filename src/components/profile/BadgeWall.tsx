'use client'

import { useDictionary } from '@/lib/i18n/context'

interface Badge {
  id: string
  name: string
  description: string | null
  icon: string
}

interface Props {
  earnedBadges: Badge[]
  allBadges: Badge[]
}

export function BadgeWall({ earnedBadges, allBadges }: Props) {
  const earnedIds = new Set(earnedBadges.map(b => b.id))
  const dict = useDictionary()

  return (
    <div className="sm-card">
      <div className="sm-card-title">{dict.profile.badges}　{earnedBadges.length}/{allBadges.length}</div>
      <div className="grid grid-cols-4 gap-[9px]">
        {allBadges.map(badge => {
          const earned = earnedIds.has(badge.id)
          return (
            <div
              key={badge.id}
              title={badge.name}
              className={`sm-bcell ${earned ? 'got' : 'no'}`}
            >
              {earned ? (
                <span className="text-[22px]">{badge.icon}</span>
              ) : (
                <span className="text-[17px]" style={{ color: '#bcc2b2' }}>？</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
