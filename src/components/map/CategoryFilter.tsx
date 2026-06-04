'use client'

import { useDictionary } from '@/lib/i18n/context'

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Props {
  categories: Category[]
  activeIds: Set<string>
  onToggle: (id: string) => void
}

export function CategoryFilter({ categories, activeIds, onToggle }: Props) {
  const dict = useDictionary()

  return (
    <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur rounded-xl shadow-lg p-3 space-y-2 max-w-[200px]">
      <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase px-1">{dict.map.category}</p>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onToggle(cat.id)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors ${
            activeIds.has(cat.id) ? 'bg-gray-100 font-medium' : 'text-gray-400'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: activeIds.has(cat.id) ? cat.color : '#d1d5db' }}
          />
          <span className="truncate">{cat.name}</span>
        </button>
      ))}
    </div>
  )
}
