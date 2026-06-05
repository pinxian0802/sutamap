'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { useDictionary, formatTemplate } from '@/lib/i18n/context'

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Location {
  id: string
  name: string
  category_id: string
}

interface Props {
  categories: Category[]
  locations: Location[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const MAX_LOCATIONS = 3

export function CategoryFilter({ categories, locations, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dict = useDictionary()

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const locationsByCategory = useMemo(() => {
    const map: Record<string, Location[]> = {}
    for (const loc of locations) {
      if (!map[loc.category_id]) map[loc.category_id] = []
      map[loc.category_id].push(loc)
    }
    return map
  }, [locations])

  const selected = categories.find(c => c.id === selectedId)
  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return categories
    return categories.filter(cat => {
      if (cat.name.toLowerCase().includes(q)) return true
      const locs = locationsByCategory[cat.id] ?? []
      return locs.some(loc => loc.name.toLowerCase().includes(q))
    })
  }, [q, categories, locationsByCategory])

  function handleSelect(id: string | null) {
    onSelect(id)
    setOpen(false)
    setQuery('')
  }

  function renderLocations(catId: string) {
    const locs = locationsByCategory[catId] ?? []
    if (locs.length === 0) return null

    const shown = locs.slice(0, MAX_LOCATIONS)
    const remaining = locs.length - MAX_LOCATIONS

    return (
      <div className="text-[11.5px] text-sub mt-[3px] leading-[1.6]">
        {shown.map((loc, i) => {
          const isMatch = q && loc.name.toLowerCase().includes(q)
          return (
            <span key={loc.id}>
              {i > 0 && '、'}
              {isMatch ? <strong className="text-ink">{loc.name}</strong> : loc.name}
            </span>
          )
        })}
        {remaining > 0 && (
          <span className="ml-[2px] text-[10.5px]">
            {formatTemplate(dict.map.moreLocations, { count: remaining })}
          </span>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className="absolute top-0 left-[14px] pt-[10px] z-[500] w-[440px] max-w-[calc(100%-28px)]">
      {/* Main bar */}
      <div
        className="flex items-center gap-[9px] bg-paper border border-line rounded-[13px] py-[11px] px-[14px] cursor-pointer"
        style={{ boxShadow: '0 8px 20px -12px rgba(45,74,107,.4)' }}
        onClick={() => setOpen(v => !v)}
      >
        <Search size={18} className="text-sub flex-shrink-0" />

        {open ? (
          <input
            ref={inputRef}
            type="text"
            className="flex-1 border-none outline-none text-[14px] bg-transparent text-ink placeholder:text-sub"
            style={{ fontFamily: 'var(--font-sans)' }}
            placeholder={dict.map.searchPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
        ) : selected ? (
          <div className="flex-1 flex items-center gap-[8px] min-w-0">
            <span
              className="w-[20px] h-[20px] rounded-[6px] grid place-items-center text-white text-[11px] flex-shrink-0"
              style={{ background: selected.color }}
            >
              {selected.icon}
            </span>
            <span className="text-[14px] font-bold truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="flex-1 text-[14px] text-sub">{dict.map.allCategories}</span>
        )}

        {open && query ? (
          <button
            className="p-0 bg-transparent border-none cursor-pointer flex-shrink-0"
            onClick={e => { e.stopPropagation(); setQuery('') }}
          >
            <X size={16} className="text-sub" />
          </button>
        ) : (
          <ChevronDown
            size={16}
            strokeWidth={2.4}
            className="text-sub flex-shrink-0 transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : undefined }}
          />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="mt-[6px] bg-paper border border-line rounded-[13px] overflow-hidden max-h-[60vh] overflow-y-auto"
          style={{ boxShadow: '0 12px 32px -8px rgba(45,74,107,.25)', animation: 'filterIn .18s ease' }}
        >
          <style>{`
            @keyframes filterIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
            .cf-item { transition: background .12s; }
            .cf-item:hover { background: var(--paper2) !important; }
          `}</style>

          {/* All */}
          {!q && (
            <button
              className="cf-item flex items-center gap-[10px] w-full text-left py-[12px] px-[14px] cursor-pointer border-b border-line2"
              style={{ background: selectedId === null ? 'var(--tint)' : 'transparent' }}
              onClick={() => handleSelect(null)}
            >
              <span
                className="w-[30px] h-[30px] rounded-[9px] grid place-items-center text-[14px] flex-shrink-0"
                style={{ background: 'var(--ink2)', color: '#fff' }}
              >
                ◉
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-bold">{dict.map.allCategories}</span>
              </div>
              {selectedId === null && <span className="text-green text-[14px] flex-shrink-0">✓</span>}
            </button>
          )}

          {filtered.map(cat => {
            const isActive = selectedId === cat.id
            return (
              <button
                key={cat.id}
                className="cf-item flex items-start gap-[10px] w-full text-left py-[12px] px-[14px] cursor-pointer border-b border-line2 last:border-b-0"
                style={{ background: isActive ? 'var(--tint)' : 'transparent' }}
                onClick={() => handleSelect(isActive ? null : cat.id)}
              >
                <span
                  className="w-[30px] h-[30px] rounded-[9px] grid place-items-center text-white text-[16px] flex-shrink-0 mt-[1px]"
                  style={{ background: cat.color }}
                >
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-bold">{cat.name}</span>
                  {renderLocations(cat.id)}
                </div>
                {isActive && <span className="text-green text-[14px] flex-shrink-0 mt-[1px]">✓</span>}
              </button>
            )
          })}

          {q && filtered.length === 0 && (
            <div className="py-[20px] text-center text-[13px] text-sub">
              {dict.map.tryOtherKeyword}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
