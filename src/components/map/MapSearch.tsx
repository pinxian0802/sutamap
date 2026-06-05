'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ArrowLeft, X, Check, ChevronRight } from 'lucide-react'
import { useDictionary, formatTemplate } from '@/lib/i18n/context'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  category_id: string
  categories: { id: string; name: string; color: string; icon: string; checkin_radius_meters: number; xp_per_checkin: number }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Props {
  locations: Location[]
  categories: Category[]
  checkedSet: Set<string>
  onSelectLocation: (loc: Location) => void
  onSelectCategory: (catId: string) => void
  onClose: () => void
}

export function MapSearch({ locations, categories, checkedSet, onSelectLocation, onSelectCategory, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dict = useDictionary()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const q = query.trim().toLowerCase()

  const locationResults = q.length > 0
    ? locations.filter(loc =>
        loc.name.toLowerCase().includes(q) ||
        loc.categories.name.toLowerCase().includes(q)
      ).slice(0, 20)
    : []

  const categoryResults = q.length > 0
    ? categories.filter(cat => cat.name.toLowerCase().includes(q))
    : []

  return (
    <div
      className="absolute inset-0 z-[550] bg-paper flex flex-col"
      style={{ animation: 'searchIn .22s ease' }}
    >
      <style>{`@keyframes searchIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }`}</style>

      <div className="flex items-center gap-[10px] px-[14px] py-[10px] border-b border-line">
        <button className="sm-iconbtn" onClick={onClose}>
          <ArrowLeft size={18} strokeWidth={2} className="text-sub" />
        </button>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 border-none outline-none text-[15px] bg-transparent text-ink placeholder:text-sub"
          style={{ fontFamily: 'var(--font-sans)' }}
          placeholder={dict.map.searchInputPlaceholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query.length > 0 && (
          <button className="p-1 cursor-pointer bg-transparent border-none" onClick={() => setQuery('')}>
            <X size={18} className="text-sub" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-[14px] pb-5 sm-noscroll">
        {q.length === 0 ? (
          <>
            <div className="text-[11px] font-bold tracking-[.12em] text-sub uppercase mt-[14px] mb-[6px] ml-[2px]">
              {dict.map.searchByTheme}
            </div>
            {categories.map(cat => {
              const catLocations = locations.filter(l => l.category_id === cat.id)
              const checkedCount = catLocations.filter(l => checkedSet.has(l.id)).length
              return (
                <button
                  key={cat.id}
                  className="flex items-center gap-3 w-full text-left py-[13px] px-[2px] border-b border-line2 cursor-pointer bg-transparent border-x-0 border-t-0"
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span className="w-[38px] h-[38px] rounded-[11px] grid place-items-center flex-shrink-0 text-white text-[18px]" style={{ background: cat.color }}>
                    {cat.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-bold">{cat.name}</div>
                    <div className="text-[11.5px] text-sub mt-[2px]">
                      {checkedCount} / {catLocations.length} {dict.map.completed}
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2} className="text-sub" />
                </button>
              )
            })}

            <div className="text-[11px] font-bold tracking-[.12em] text-sub uppercase mt-[18px] mb-[6px] ml-[2px]">
              {dict.map.recentLocations}
            </div>
            {locations.slice(0, 5).map(loc => {
              const c = loc.categories
              const checked = checkedSet.has(loc.id)
              return (
                <button
                  key={loc.id}
                  className="flex items-center gap-3 w-full text-left py-[13px] px-[2px] border-b border-line2 cursor-pointer bg-transparent border-x-0 border-t-0"
                  onClick={() => onSelectLocation(loc)}
                >
                  <span className="w-[38px] h-[38px] rounded-[11px] grid place-items-center flex-shrink-0 text-white text-[16px]" style={{ background: c.color }}>
                    {c.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-bold">{loc.name}</div>
                    <div className="text-[11.5px] text-sub mt-[2px]">{c.name}</div>
                  </div>
                  {checked
                    ? <Check size={16} strokeWidth={2.4} className="text-green" />
                    : <ChevronRight size={16} strokeWidth={2} className="text-sub" />}
                </button>
              )
            })}
          </>
        ) : (categoryResults.length > 0 || locationResults.length > 0) ? (
          <>
            {categoryResults.length > 0 && (
              <>
                <div className="text-[11px] font-bold tracking-[.12em] text-sub uppercase mt-[14px] mb-[6px] ml-[2px]">
                  {dict.map.themeSection}
                </div>
                {categoryResults.map(cat => {
                  const catLocations = locations.filter(l => l.category_id === cat.id)
                  return (
                    <button
                      key={cat.id}
                      className="flex items-center gap-3 w-full text-left py-[13px] px-[2px] border-b border-line2 cursor-pointer bg-transparent border-x-0 border-t-0"
                      onClick={() => onSelectCategory(cat.id)}
                    >
                      <span className="w-[38px] h-[38px] rounded-[11px] grid place-items-center flex-shrink-0 text-white text-[18px]" style={{ background: cat.color }}>
                        {cat.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14.5px] font-bold">{cat.name}</div>
                        <div className="text-[11.5px] text-sub mt-[2px]">{catLocations.length} {dict.map.locations}</div>
                      </div>
                      <ChevronRight size={16} strokeWidth={2} className="text-sub" />
                    </button>
                  )
                })}
              </>
            )}

            {locationResults.length > 0 && (
              <>
                <div className="text-[11px] font-bold tracking-[.12em] text-sub uppercase mt-[14px] mb-[6px] ml-[2px]">
                  {dict.map.locationSection}
                </div>
                {locationResults.map(loc => {
                  const c = loc.categories
                  const checked = checkedSet.has(loc.id)
                  return (
                    <button
                      key={loc.id}
                      className="flex items-center gap-3 w-full text-left py-[13px] px-[2px] border-b border-line2 cursor-pointer bg-transparent border-x-0 border-t-0"
                      onClick={() => onSelectLocation(loc)}
                    >
                      <span className="w-[38px] h-[38px] rounded-[11px] grid place-items-center flex-shrink-0 text-white text-[16px]" style={{ background: c.color }}>
                        {c.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14.5px] font-bold">{loc.name}</div>
                        <div className="text-[11.5px] text-sub mt-[2px]">{c.name}</div>
                      </div>
                      {checked
                        ? <Check size={16} strokeWidth={2.4} className="text-green" />
                        : <span className="text-[11px] text-green-d font-bold whitespace-nowrap">{dict.map.checkinFab}</span>}
                    </button>
                  )
                })}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <Search size={36} strokeWidth={1.5} className="text-line mx-auto" />
            <div className="text-[14px] font-semibold mt-3">{formatTemplate(dict.map.notFound, { query })}</div>
            <div className="text-[12px] text-sub mt-1.5">{dict.map.tryOtherKeyword}</div>
          </div>
        )}
      </div>
    </div>
  )
}
