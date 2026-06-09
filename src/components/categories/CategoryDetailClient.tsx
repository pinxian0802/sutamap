'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check } from 'lucide-react'
import { MapView } from '@/components/map/MapView'
import { useDictionary } from '@/lib/i18n/context'

export interface DetailLocation {
  id: string
  name: string
  prefecture: string | null
  lat: number
  lng: number
  category_id: string
  categories: { id: string; name: string; color: string; icon: string; checkin_radius_meters: number; xp_per_checkin: number }
  checked: boolean
}

export interface DetailFriend {
  userId: string
  username: string
  checked: number
}

export interface DetailCategory {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  xp_per_checkin: number
}

interface Props {
  category: DetailCategory
  locations: DetailLocation[]
  checkedCount: number
  friends: DetailFriend[]
  isLoggedIn: boolean
}

export function CategoryDetailClient({ category, locations, checkedCount, friends, isLoggedIn }: Props) {
  const dict = useDictionary()
  const router = useRouter()
  const mapWrapRef = useRef<HTMLDivElement>(null)
  const [focusLocationId, setFocusLocationId] = useState<string | null>(null)

  const total = locations.length
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0
  const isComplete = checkedCount === total && total > 0

  function handleLocationClick(id: string) {
    setFocusLocationId(id)
    mapWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4">
      {/* back + header */}
      <div className="flex items-center gap-[8px] px-[2px] pt-[6px] pb-[14px]">
        <button onClick={() => router.back()} className="sm-iconbtn" aria-label="back">
          <ChevronLeft size={18} className="text-sub" />
        </button>
        <div className="flex items-center gap-[9px] min-w-0">
          <span
            className="w-[26px] h-[26px] rounded-lg text-white grid place-items-center flex-shrink-0 text-[15px]"
            style={{ background: category.color }}
          >
            {category.icon}
          </span>
          <h1 className="text-[19px] font-bold truncate" style={{ fontFamily: 'var(--font-display)' }}>{category.name}</h1>
        </div>
      </div>

      {/* intro + stats */}
      <div className="sm-card">
        {category.description && (
          <p className="text-[13px] text-sub leading-[1.7] mb-[12px]">{category.description}</p>
        )}
        <div className="flex items-stretch gap-[8px]">
          <div className="flex-1 text-center py-[8px] rounded-[10px]" style={{ background: 'var(--paper2)' }}>
            <div className="sm-mono text-[17px] font-bold">{total}</div>
            <div className="text-[10.5px] text-sub mt-[2px]">{dict.categories.spots}</div>
          </div>
          <div className="flex-1 text-center py-[8px] rounded-[10px]" style={{ background: 'var(--paper2)' }}>
            <div className="sm-mono text-[17px] font-bold" style={{ color: 'var(--green-d)' }}>{checkedCount}</div>
            <div className="text-[10.5px] text-sub mt-[2px]">{dict.map.visited}</div>
          </div>
          <div className="flex-1 text-center py-[8px] rounded-[10px]" style={{ background: 'var(--paper2)' }}>
            <div className="sm-mono text-[17px] font-bold">{category.xp_per_checkin}</div>
            <div className="text-[10.5px] text-sub mt-[2px]">{dict.categories.xpPerSpot}</div>
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-[12px]">
          <div className="flex items-center justify-between mb-[5px]">
            <span className="text-[11.5px] text-sub">{dict.categories.collectionProgress}</span>
            <span className="sm-mono text-[12px] font-bold" style={{ color: isComplete ? 'var(--green-d)' : 'var(--sub)' }}>
              {isComplete ? dict.categories.complete : `${checkedCount}/${total}`}
            </span>
          </div>
          <div className="sm-pbar" style={{ height: 6 }}>
            <div className="sm-pfill" style={{ width: `${pct}%`, background: category.color }} />
          </div>
        </div>
      </div>

      {/* embedded map */}
      <div ref={mapWrapRef} className="sm-card overflow-hidden p-0">
        <div className="w-full" style={{ height: 280 }}>
          <MapView
            locations={locations}
            categories={[{ id: category.id, name: category.name, color: category.color, icon: category.icon }]}
            userCheckinLocationIds={locations.filter(l => l.checked).map(l => l.id)}
            friendCheckins={[]}
            isLoggedIn={isLoggedIn}
            lockedCategoryId={category.id}
            focusLocationId={focusLocationId}
            embedded
          />
        </div>
      </div>

      {/* location list */}
      <div className="sm-card">
        <div className="sm-card-title">{dict.categories.locationsList}</div>
        {total === 0 ? (
          <div className="py-[18px] text-center text-[13px] text-sub">{dict.categories.emptyLocations}</div>
        ) : (
          locations.map((loc, i) => (
            <button
              key={loc.id}
              onClick={() => handleLocationClick(loc.id)}
              className="flex items-center gap-[9px] w-full text-left py-[10px] cursor-pointer bg-transparent border-none"
              style={i === 0 ? undefined : { borderTop: '1px solid var(--line2)' }}
            >
              <span
                className="w-[22px] h-[22px] rounded-full grid place-items-center flex-shrink-0"
                style={{ background: loc.checked ? 'var(--green)' : 'var(--paper2)' }}
              >
                {loc.checked && <Check size={13} strokeWidth={3} className="text-white" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold truncate">{loc.name}</div>
                {loc.prefecture && <div className="text-[11px] text-sub">{loc.prefecture}</div>}
              </div>
            </button>
          ))
        )}
      </div>

      {/* friends */}
      {friends.length > 0 && (
        <div className="sm-card">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {friends.slice(0, 5).map(f => (
                <span
                  key={f.userId}
                  className="w-5 h-5 rounded-full bg-ink2 text-white text-[9px] font-bold grid place-items-center border border-paper"
                >
                  {f.username[0]?.toUpperCase()}
                </span>
              ))}
            </div>
            <span className="text-[11.5px] text-sub">{dict.categories.friendsWorking}</span>
          </div>
        </div>
      )}
    </div>
  )
}
