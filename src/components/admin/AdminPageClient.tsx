'use client'

import { useState } from 'react'
import { useDictionary } from '@/lib/i18n/context'
import { formatTemplate } from '@/lib/i18n/context'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { ThemeForm } from './ThemeForm'
import { LocationList } from './LocationList'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Theme = Database['public']['Tables']['themes']['Row']
type Location = Database['public']['Tables']['locations']['Row']

interface Props {
  initialThemes: Theme[]
  initialLocations: Location[]
}

export function AdminPageClient({ initialThemes, initialLocations }: Props) {
  const dict = useDictionary()
  const [themes, setThemes] = useState(initialThemes)
  const [locations, setLocations] = useState(initialLocations)
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null)
  const [showAddTheme, setShowAddTheme] = useState(false)

  const handleThemeSaved = (theme: Theme, isNew: boolean) => {
    if (isNew) {
      setThemes(prev => [...prev, theme])
      setShowAddTheme(false)
    } else {
      setThemes(prev => prev.map(t => t.uuid === theme.uuid ? theme : t))
      setEditingThemeId(null)
    }
    toast.success(dict.admin.saved)
  }

  const handleThemeDeleted = (id: string) => {
    const deleted = themes.find(t => t.uuid === id)
    setThemes(prev => prev.filter(t => t.uuid !== id))
    setLocations(prev => prev.filter(l => l.theme_id !== deleted?.theme_id))
    setEditingThemeId(null)
    setExpandedThemeId(null)
    toast.success(dict.admin.deleted)
  }

  const handleLocationSaved = (loc: Location, isNew: boolean) => {
    if (isNew) {
      setLocations(prev => [...prev, loc])
    } else {
      setLocations(prev => prev.map(l => l.id === loc.id ? loc : l))
    }
    toast.success(dict.admin.saved)
  }

  const handleLocationDeleted = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id))
    toast.success(dict.admin.deleted)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {dict.admin.title}
        </h1>
      </div>

      <div className="sm-card">
        <div className="sm-card-title">{dict.admin.themes}</div>

        {themes.length === 0 && (
          <p className="text-sm text-sub py-4 text-center">{dict.admin.noThemes}</p>
        )}

        <div className="flex flex-col gap-2">
          {themes.map(theme => {
            const themeLocations = locations.filter(l => l.theme_id === theme.theme_id)
            const isEditing = editingThemeId === theme.uuid
            const isExpanded = expandedThemeId === theme.uuid

            return (
              <div key={theme.uuid} className="rounded-xl border border-line overflow-hidden">
                {isEditing ? (
                  <div className="p-3">
                    <ThemeForm
                      theme={theme}
                      onSaved={t => handleThemeSaved(t, false)}
                      onCancel={() => setEditingThemeId(null)}
                      onDeleted={() => handleThemeDeleted(theme.uuid)}
                    />
                  </div>
                ) : (
                  <>
                    <button
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-paper2 transition-colors"
                      onClick={() => setExpandedThemeId(isExpanded ? null : theme.uuid)}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: theme.color + '20', color: theme.color }}
                      >
                        {theme.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-ink truncate">{theme.name}</div>
                        <div className="text-xs text-sub">
                          {formatTemplate(dict.admin.locationCount, { count: themeLocations.length })}
                        </div>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        className="sm-iconbtn !w-7 !h-7"
                        onClick={(e) => { e.stopPropagation(); setEditingThemeId(theme.uuid) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setEditingThemeId(theme.uuid) } }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                      </div>
                      {isExpanded ? <ChevronDown size={16} className="text-sub" /> : <ChevronRight size={16} className="text-sub" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-line px-3 pb-3 pt-2">
                        <LocationList
                          themeId={theme.uuid}
                          locations={themeLocations}
                          onSaved={handleLocationSaved}
                          onDeleted={handleLocationDeleted}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {showAddTheme ? (
          <div className="mt-3 p-3 rounded-xl border border-line">
            <ThemeForm
              onSaved={t => handleThemeSaved(t, true)}
              onCancel={() => setShowAddTheme(false)}
            />
          </div>
        ) : (
          <button
            className="sm-btn sm-btn-ghost mt-3 !text-[13px]"
            onClick={() => setShowAddTheme(true)}
          >
            <Plus size={16} />
            {dict.admin.addTheme}
          </button>
        )}
      </div>
    </div>
  )
}
