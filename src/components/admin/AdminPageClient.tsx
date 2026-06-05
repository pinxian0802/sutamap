'use client'

import { useState } from 'react'
import { useDictionary } from '@/lib/i18n/context'
import { formatTemplate } from '@/lib/i18n/context'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { CategoryForm } from './CategoryForm'
import { LocationList } from './LocationList'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type Location = Database['public']['Tables']['locations']['Row']

interface Props {
  initialCategories: Category[]
  initialLocations: Location[]
}

export function AdminPageClient({ initialCategories, initialLocations }: Props) {
  const dict = useDictionary()
  const [categories, setCategories] = useState(initialCategories)
  const [locations, setLocations] = useState(initialLocations)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)

  const handleCategorySaved = (cat: Category, isNew: boolean) => {
    if (isNew) {
      setCategories(prev => [...prev, cat])
      setShowAddCategory(false)
    } else {
      setCategories(prev => prev.map(c => c.id === cat.id ? cat : c))
      setEditingCategoryId(null)
    }
    toast.success(dict.admin.saved)
  }

  const handleCategoryDeleted = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    setLocations(prev => prev.filter(l => l.category_id !== id))
    setEditingCategoryId(null)
    setExpandedCategoryId(null)
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
        <div className="sm-card-title">{dict.admin.categories}</div>

        {categories.length === 0 && (
          <p className="text-sm text-sub py-4 text-center">{dict.admin.noCategories}</p>
        )}

        <div className="flex flex-col gap-2">
          {categories.map(cat => {
            const catLocations = locations.filter(l => l.category_id === cat.id)
            const isEditing = editingCategoryId === cat.id
            const isExpanded = expandedCategoryId === cat.id

            return (
              <div key={cat.id} className="rounded-xl border border-line overflow-hidden">
                {isEditing ? (
                  <div className="p-3">
                    <CategoryForm
                      category={cat}
                      onSaved={c => handleCategorySaved(c, false)}
                      onCancel={() => setEditingCategoryId(null)}
                      onDeleted={() => handleCategoryDeleted(cat.id)}
                    />
                  </div>
                ) : (
                  <>
                    <button
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-paper2 transition-colors"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                      >
                        {cat.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-ink truncate">{cat.name}</div>
                        <div className="text-xs text-sub">
                          {formatTemplate(dict.admin.locationCount, { count: catLocations.length })}
                        </div>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        className="sm-iconbtn !w-7 !h-7"
                        onClick={(e) => { e.stopPropagation(); setEditingCategoryId(cat.id) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setEditingCategoryId(cat.id) } }}
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
                          categoryId={cat.id}
                          locations={catLocations}
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

        {showAddCategory ? (
          <div className="mt-3 p-3 rounded-xl border border-line">
            <CategoryForm
              onSaved={c => handleCategorySaved(c, true)}
              onCancel={() => setShowAddCategory(false)}
            />
          </div>
        ) : (
          <button
            className="sm-btn sm-btn-ghost mt-3 !text-[13px]"
            onClick={() => setShowAddCategory(true)}
          >
            <Plus size={16} />
            {dict.admin.addCategory}
          </button>
        )}
      </div>
    </div>
  )
}
