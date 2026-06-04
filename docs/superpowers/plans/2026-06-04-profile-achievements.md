# Profile + Achievements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the personal profile page (XP, level, active title selector, badge wall), the public profile page, the categories/themes progress page (with friends who share the theme), and a navigation bar.

**Architecture:** Profile pages are Server Components fetching all data server-side. TitleSelector is a Client Component (calls Supabase directly). Category page fetches friends' progress via a Supabase join. A shared NavBar provides bottom navigation for mobile.

**Tech Stack:** Supabase server client, Shadcn Progress component, Next.js App Router

**Prerequisite:** Plans 1 and 2 must be complete.

---

## File Structure

```
src/
├── app/
│   ├── profile/
│   │   ├── page.tsx                     # Own profile (requires auth)
│   │   └── [userId]/
│   │       └── page.tsx                 # Public profile (read-only)
│   └── categories/
│       └── page.tsx                     # All themes + progress + friends
├── components/
│   ├── profile/
│   │   ├── ProfileHeader.tsx            # Avatar, username, level bar, active title
│   │   ├── BadgeWall.tsx                # Grid of earned badges (greyed if not earned)
│   │   ├── TitleSelector.tsx            # Client Component: select active title
│   │   └── CategoryProgressList.tsx     # List of category progress bars
│   ├── categories/
│   │   └── CategoryCard.tsx             # Category card with progress + friend avatars
│   └── layout/
│       └── NavBar.tsx                   # Bottom nav bar (mobile-first)
└── app/
    └── layout.tsx                       # Add NavBar here
```

---

## Task 1: NavBar

**Files:**
- Create: `src/components/layout/NavBar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write NavBar** `src/components/layout/NavBar.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/map', icon: '🗾', label: '地図' },
  { href: '/categories', icon: '🎯', label: 'テーマ' },
  { href: '/leaderboard', icon: '🏆', label: 'ランキング' },
  { href: '/friends', icon: '👥', label: 'フレンド' },
  { href: '/profile', icon: '👤', label: 'プロフィール' },
]

export function NavBar() {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[600] bg-white/95 backdrop-blur border-t border-gray-100 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Add NavBar to root layout** — modify `src/app/layout.tsx`

Replace the existing layout body with:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geist.className} pb-16`}>
        {children}
        <NavBar />
      </body>
    </html>
  )
}
```

Add import at top:
```tsx
import { NavBar } from '@/components/layout/NavBar'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: bottom navigation bar"
```

---

## Task 2: ProfileHeader Component

**Files:**
- Create: `src/components/profile/ProfileHeader.tsx`

- [ ] **Step 1: Install Shadcn Progress**

```bash
npx shadcn@latest add progress
```

- [ ] **Step 2: Write ProfileHeader** `src/components/profile/ProfileHeader.tsx`

```tsx
import { Progress } from '@/components/ui/progress'
import { xpToNextLevel } from '@/lib/xp/calculator'

interface Props {
  username: string
  totalXp: number
  level: number
  activeTitle?: string | null
}

export function ProfileHeader({ username, totalXp, level, activeTitle }: Props) {
  const { current, needed } = xpToNextLevel(totalXp)
  const pct = Math.round((current / needed) * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{username}</h1>
          {activeTitle && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {activeTitle}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-gray-700">Lv {level}</span>
          <span className="text-gray-400 text-xs">{current} / {needed} XP</span>
        </div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-gray-400 text-right">Total: {totalXp} XP</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/profile/ProfileHeader.tsx
git commit -m "feat: profile header with XP level bar"
```

---

## Task 3: BadgeWall Component

**Files:**
- Create: `src/components/profile/BadgeWall.tsx`

- [ ] **Step 1: Write BadgeWall** `src/components/profile/BadgeWall.tsx`

```tsx
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

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">バッジ</h2>
      <div className="grid grid-cols-4 gap-3">
        {allBadges.map(badge => {
          const earned = earnedIds.has(badge.id)
          return (
            <div
              key={badge.id}
              title={badge.name}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
                earned ? 'bg-blue-50' : 'bg-gray-50 opacity-40'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs text-center text-gray-600 leading-tight line-clamp-2">
                {badge.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/profile/BadgeWall.tsx
git commit -m "feat: badge wall component"
```

---

## Task 4: TitleSelector Component

**Files:**
- Create: `src/components/profile/TitleSelector.tsx`

- [ ] **Step 1: Write TitleSelector** `src/components/profile/TitleSelector.tsx`

```tsx
'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Title {
  id: string
  name: string
  description: string | null
}

interface Props {
  earnedTitles: Title[]
  activeTitleId: string | null
}

export function TitleSelector({ earnedTitles, activeTitleId }: Props) {
  const [selected, setSelected] = useState(activeTitleId)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSelect(titleId: string) {
    const newId = titleId === selected ? null : titleId
    setSelected(newId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('user_profiles')
      .update({ active_title_id: newId })
      .eq('id', user.id)
    startTransition(() => router.refresh())
  }

  if (earnedTitles.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">称号</h2>
      <div className="space-y-2">
        {earnedTitles.map(title => (
          <button
            key={title.id}
            onClick={() => handleSelect(title.id)}
            disabled={isPending}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
              selected === title.id
                ? 'border-amber-400 bg-amber-50'
                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{title.name}</span>
              {selected === title.id && <span className="text-xs text-amber-600">表示中</span>}
            </div>
            {title.description && (
              <p className="text-xs text-gray-500 mt-0.5">{title.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/profile/TitleSelector.tsx
git commit -m "feat: title selector component"
```

---

## Task 5: CategoryProgressList Component

**Files:**
- Create: `src/components/profile/CategoryProgressList.tsx`

- [ ] **Step 1: Write CategoryProgressList** `src/components/profile/CategoryProgressList.tsx`

```tsx
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

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
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">進捗</h2>
      <div className="space-y-4">
        {categories.map(cat => {
          const pct = cat.total > 0 ? Math.round((cat.checked / cat.total) * 100) : 0
          return (
            <Link key={cat.id} href={`/categories`} className="block">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <span className="text-xs text-gray-400">{cat.checked} / {cat.total}</span>
              </div>
              <Progress value={pct} className="h-1.5" style={{ '--progress-color': cat.color } as React.CSSProperties} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/profile/CategoryProgressList.tsx
git commit -m "feat: category progress list component"
```

---

## Task 6: Profile Pages

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/app/profile/[userId]/page.tsx`

- [ ] **Step 1: Write own profile page** `src/app/profile/page.tsx`

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { BadgeWall } from '@/components/profile/BadgeWall'
import { TitleSelector } from '@/components/profile/TitleSelector'
import { CategoryProgressList } from '@/components/profile/CategoryProgressList'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: profile },
    { data: allBadges },
    { data: userBadges },
    { data: allTitles },
    { data: userTitles },
    { data: categories },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*, titles(name)').eq('id', user.id).single(),
    supabase.from('badges').select('*'),
    supabase.from('user_badges').select('badges(*)').eq('user_id', user.id),
    supabase.from('titles').select('*'),
    supabase.from('user_titles').select('titles(*)').eq('user_id', user.id),
    supabase.from('categories').select('*'),
  ])

  // Build per-category progress
  const { data: firstCheckins } = await supabase
    .from('checkins')
    .select('location_id, locations(category_id)')
    .eq('user_id', user.id)
    .eq('is_first', true)

  const { data: locationCounts } = await supabase
    .from('locations')
    .select('category_id')
    .eq('is_active', true)

  const totalPerCategory: Record<string, number> = {}
  locationCounts?.forEach(l => {
    totalPerCategory[l.category_id] = (totalPerCategory[l.category_id] ?? 0) + 1
  })

  const checkedPerCategory: Record<string, number> = {}
  firstCheckins?.forEach(c => {
    const catId = (c.locations as any)?.category_id
    if (catId) checkedPerCategory[catId] = (checkedPerCategory[catId] ?? 0) + 1
  })

  const categoryProgress = (categories ?? []).map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    total: totalPerCategory[cat.id] ?? 0,
    checked: checkedPerCategory[cat.id] ?? 0,
  }))

  const earnedBadges = userBadges?.map((ub: any) => ub.badges).filter(Boolean) ?? []
  const earnedTitles = userTitles?.map((ut: any) => ut.titles).filter(Boolean) ?? []

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <ProfileHeader
        username={profile?.username ?? ''}
        totalXp={profile?.total_xp ?? 0}
        level={profile?.level ?? 1}
        activeTitle={(profile as any)?.titles?.name}
      />
      <TitleSelector
        earnedTitles={earnedTitles}
        activeTitleId={profile?.active_title_id ?? null}
      />
      <BadgeWall earnedBadges={earnedBadges} allBadges={allBadges ?? []} />
      <CategoryProgressList categories={categoryProgress} />
    </div>
  )
}
```

- [ ] **Step 2: Write public profile page** `src/app/profile/[userId]/page.tsx`

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { BadgeWall } from '@/components/profile/BadgeWall'
import { CategoryProgressList } from '@/components/profile/CategoryProgressList'

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()

  const [
    { data: profile },
    { data: allBadges },
    { data: userBadges },
    { data: categories },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*, titles(name)').eq('id', userId).single(),
    supabase.from('badges').select('*'),
    supabase.from('user_badges').select('badges(*)').eq('user_id', userId),
    supabase.from('categories').select('*'),
  ])

  if (!profile) notFound()

  const { data: firstCheckins } = await supabase
    .from('checkins')
    .select('location_id, locations(category_id)')
    .eq('user_id', userId)
    .eq('is_first', true)

  const { data: locationCounts } = await supabase
    .from('locations').select('category_id').eq('is_active', true)

  const totalPerCategory: Record<string, number> = {}
  locationCounts?.forEach(l => {
    totalPerCategory[l.category_id] = (totalPerCategory[l.category_id] ?? 0) + 1
  })

  const checkedPerCategory: Record<string, number> = {}
  firstCheckins?.forEach(c => {
    const catId = (c.locations as any)?.category_id
    if (catId) checkedPerCategory[catId] = (checkedPerCategory[catId] ?? 0) + 1
  })

  const categoryProgress = (categories ?? []).map(cat => ({
    id: cat.id, name: cat.name, color: cat.color, icon: cat.icon,
    total: totalPerCategory[cat.id] ?? 0,
    checked: checkedPerCategory[cat.id] ?? 0,
  }))

  const earnedBadges = userBadges?.map((ub: any) => ub.badges).filter(Boolean) ?? []

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <ProfileHeader
        username={profile.username}
        totalXp={profile.total_xp}
        level={profile.level}
        activeTitle={(profile as any).titles?.name}
      />
      <BadgeWall earnedBadges={earnedBadges} allBadges={allBadges ?? []} />
      <CategoryProgressList categories={categoryProgress} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/profile/
git commit -m "feat: profile pages — own and public"
```

---

## Task 7: Categories Page

**Files:**
- Create: `src/app/categories/page.tsx`
- Create: `src/components/categories/CategoryCard.tsx`

- [ ] **Step 1: Write CategoryCard** `src/components/categories/CategoryCard.tsx`

```tsx
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

interface Friend {
  userId: string
  username: string
  checked: number
}

interface Props {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  total: number
  checked: number
  xpPerCheckin: number
  friends: Friend[]
}

export function CategoryCard({ id, name, description, color, icon, total, checked, xpPerCheckin, friends }: Props) {
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  const isComplete = checked === total

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isComplete ? 'ring-2 ring-amber-400' : ''}`}>
      <div className="h-1.5" style={{ background: color }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-bold text-sm">{name}</h3>
              {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {isComplete && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">完了！</span>}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{checked} / {total} 箇所</span>
            <span>{xpPerCheckin} XP/箇所</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {friends.length > 0 && (
          <div className="border-t pt-2">
            <p className="text-xs text-gray-400 mb-1.5">フレンドも挑戦中</p>
            <div className="flex gap-2 flex-wrap">
              {friends.map(f => (
                <Link key={f.userId} href={`/profile/${f.userId}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                    {f.username[0].toUpperCase()}
                  </div>
                  <span>{f.username}</span>
                  <span className="text-gray-400">({f.checked})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write categories page** `src/app/categories/page.tsx`

```tsx
import { createClient } from '@/lib/supabase/server'
import { CategoryCard } from '@/components/categories/CategoryCard'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: categories }, { data: locations }] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('locations').select('id, category_id').eq('is_active', true),
  ])

  const totalPerCategory: Record<string, number> = {}
  locations?.forEach(l => {
    totalPerCategory[l.category_id] = (totalPerCategory[l.category_id] ?? 0) + 1
  })

  let checkedPerCategory: Record<string, number> = {}
  let friendsPerCategory: Record<string, { userId: string; username: string; checked: number }[]> = {}

  if (user) {
    const { data: myCheckins } = await supabase
      .from('checkins')
      .select('location_id, locations(category_id)')
      .eq('user_id', user.id)
      .eq('is_first', true)

    myCheckins?.forEach(c => {
      const catId = (c.locations as any)?.category_id
      if (catId) checkedPerCategory[catId] = (checkedPerCategory[catId] ?? 0) + 1
    })

    // Get accepted friends
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendIds = friendships?.map(f =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    ) ?? []

    if (friendIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from('user_profiles')
        .select('id, username')
        .in('id', friendIds)

      for (const friend of friendProfiles ?? []) {
        const { data: fCheckins } = await supabase
          .from('checkins')
          .select('location_id, locations(category_id)')
          .eq('user_id', friend.id)
          .eq('is_first', true)

        const fPerCat: Record<string, number> = {}
        fCheckins?.forEach(c => {
          const catId = (c.locations as any)?.category_id
          if (catId) fPerCat[catId] = (fPerCat[catId] ?? 0) + 1
        })

        Object.entries(fPerCat).forEach(([catId, count]) => {
          if (!friendsPerCategory[catId]) friendsPerCategory[catId] = []
          friendsPerCategory[catId].push({ userId: friend.id, username: friend.username, checked: count })
        })
      }
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">テーマ一覧</h1>
      {(categories ?? []).map(cat => (
        <CategoryCard
          key={cat.id}
          id={cat.id}
          name={cat.name}
          description={cat.description}
          color={cat.color}
          icon={cat.icon}
          total={totalPerCategory[cat.id] ?? 0}
          checked={checkedPerCategory[cat.id] ?? 0}
          xpPerCheckin={cat.xp_per_checkin}
          friends={friendsPerCategory[cat.id] ?? []}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/categories/ src/components/categories/
git commit -m "feat: categories page with progress and friend activity"
```

---

## Task 8: Verify

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify profile page**

Log in and open http://localhost:3000/profile — should show username, XP bar, badge wall.

- [ ] **Step 3: Verify categories page**

Open http://localhost:3000/categories — should show 四極点 category card with progress 0/4.

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: profile and categories pages complete"
```
