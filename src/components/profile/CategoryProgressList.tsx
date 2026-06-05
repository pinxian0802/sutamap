'use client'

import Link from 'next/link'
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
    <div className="sm-card">
      <div className="sm-card-title">
        {dict.profile.collection}
        <Link href="/categories" className="ml-auto text-[11.5px] font-bold text-green-d flex items-center gap-[1px]" style={{ fontFamily: 'var(--font-sans)' }}>
          {dict.profile.collectionLink}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
        </Link>
      </div>
      {categories.map(cat => {
        const done = cat.checked >= cat.total && cat.total > 0
        const pct = cat.total > 0 ? Math.round((cat.checked / cat.total) * 100) : 0
        return (
          <Link key={cat.id} href="/categories" className="block py-[9px] cursor-pointer">
            <div className="flex items-center gap-[9px]">
              <span
                className="w-[26px] h-[26px] rounded-lg text-white grid place-items-center flex-shrink-0 text-[15px]"
                style={{ background: cat.color }}
              >
                {cat.icon}
              </span>
              <span className="flex-1 font-bold text-[14px]">{cat.name}</span>
              <span className="sm-mono text-[12px] font-bold" style={{ color: done ? 'var(--green-d)' : 'var(--sub)' }}>
                {done ? dict.categories.complete : `${cat.checked}/${cat.total}`}
              </span>
            </div>
            <div className="mt-2">
              <div className="sm-pbar" style={{ height: 6 }}>
                <div className="sm-pfill" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
