'use client'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { useDictionary } from '@/lib/i18n/context'

interface CategoryProgress {
  id: string
  name: string
  color: string
  icon: string
  total: number
  checked: number
}

interface Props {
  categories: CategoryProgress[]
}

export function CategoryProgressList({ categories }: Props) {
  const dict = useDictionary()

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{dict.profile.progress}</h2>
      <div className="space-y-4">
        {categories.map(cat => {
          const pct = cat.total > 0 ? Math.round((cat.checked / cat.total) * 100) : 0
          return (
            <Link key={cat.id} href="/categories" className="block">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <span className="text-xs text-gray-400">{cat.checked} / {cat.total}</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
