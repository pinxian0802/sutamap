# Social + Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the friends system (add by username/ID/QR/link, accept/reject requests, friends list), the friend map mode (overlay all friends' check-ins on the map in different colors), and the leaderboard (XP / check-in count / badge count, friends tab + global tab).

**Architecture:** Friends API routes handle request/accept/reject. QR code is generated client-side with the `qrcode.react` library. Friend map layer fetches friends' first check-ins and renders colored markers on top of the main map. Leaderboard uses Supabase queries with ranking via `row_number()` window function.

**Tech Stack:** qrcode.react, Supabase server client, Leaflet, Next.js App Router

**Prerequisite:** Plans 1, 2, and 3 must be complete.

---

## File Structure

```
src/
├── app/
│   ├── friends/
│   │   └── page.tsx                     # Friends list + add friend
│   ├── leaderboard/
│   │   └── page.tsx                     # Leaderboard tabs
│   └── api/
│       └── friends/
│           ├── route.ts                 # GET (list), POST (send request)
│           └── [id]/
│               └── route.ts             # PATCH (accept/reject), DELETE (remove)
├── components/
│   ├── friends/
│   │   ├── FriendsList.tsx              # Client Component: tabs + list
│   │   ├── FriendCard.tsx               # Individual friend row
│   │   ├── AddFriendModal.tsx           # Client Component: search + QR + link
│   │   └── QRCodeDisplay.tsx            # QR code for own profile
│   ├── map/
│   │   └── FriendLayer.tsx              # Client Component: friend check-in overlay
│   └── leaderboard/
│       ├── LeaderboardTabs.tsx          # Client Component: tabs (XP/checkins/badges × friends/global)
│       └── LeaderboardTable.tsx         # Table rows
```

---

## Task 1: Friends API Routes

**Files:**
- Create: `src/app/api/friends/route.ts`
- Create: `src/app/api/friends/[id]/route.ts`

- [ ] **Step 1: Write friends list + send request route** `src/app/api/friends/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: list accepted friends + pending requests
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: friendships } = await supabase
    .from('friendships')
    .select('*, requester:requester_id(id, username:user_profiles(username)), addressee:addressee_id(id, username:user_profiles(username))')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  return NextResponse.json({ friendships: friendships ?? [] })
}

// POST: send friend request by username or userId
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetId, targetUsername } = await request.json()

  let addresseeId = targetId
  if (!addresseeId && targetUsername) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', targetUsername)
      .maybeSingle()
    addresseeId = profile?.id
  }

  if (!addresseeId) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (addresseeId === user.id) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 })

  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: user.id, addressee_id: addresseeId, status: 'pending' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Write accept/reject/delete route** `src/app/api/friends/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH: accept or reject
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await request.json() // 'accepted' | 'rejected'
  const { error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', id)
    .eq('addressee_id', user.id) // only addressee can accept/reject

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE: remove friendship
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', id)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/friends/
git commit -m "feat: friends API routes — send, accept, reject, delete"
```

---

## Task 2: QRCode Component

**Files:**
- Create: `src/components/friends/QRCodeDisplay.tsx`

- [ ] **Step 1: Install qrcode.react**

```bash
npm install qrcode.react
```

- [ ] **Step 2: Write QRCodeDisplay** `src/components/friends/QRCodeDisplay.tsx`

```tsx
'use client'

import { QRCodeSVG } from 'qrcode.react'

interface Props {
  userId: string
}

export function QRCodeDisplay({ userId }: Props) {
  const profileUrl = `${window.location.origin}/profile/${userId}`

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <QRCodeSVG value={profileUrl} size={180} />
      <p className="text-xs text-gray-400 text-center break-all">{profileUrl}</p>
      <button
        onClick={() => navigator.clipboard.writeText(profileUrl)}
        className="text-sm text-blue-600 underline"
      >
        リンクをコピー
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/friends/QRCodeDisplay.tsx
git commit -m "feat: QR code display for profile sharing"
```

---

## Task 3: AddFriendModal + FriendCard

**Files:**
- Create: `src/components/friends/AddFriendModal.tsx`
- Create: `src/components/friends/FriendCard.tsx`

- [ ] **Step 1: Write FriendCard** `src/components/friends/FriendCard.tsx`

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  friendshipId: string
  userId: string
  username: string
  level: number
  status: 'pending' | 'accepted' | 'rejected'
  isRequester: boolean
}

export function FriendCard({ friendshipId, userId, username, level, status, isRequester }: Props) {
  const router = useRouter()

  async function handleAccept() {
    await fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    router.refresh()
  }

  async function handleReject() {
    await fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    })
    router.refresh()
  }

  async function handleRemove() {
    await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Link href={`/profile/${userId}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
          {username[0].toUpperCase()}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${userId}`} className="font-semibold text-sm hover:text-blue-600">
          {username}
        </Link>
        <p className="text-xs text-gray-400">Lv {level}</p>
      </div>
      <div className="flex gap-2">
        {status === 'pending' && !isRequester && (
          <>
            <button onClick={handleAccept} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">承認</button>
            <button onClick={handleReject} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">拒否</button>
          </>
        )}
        {status === 'pending' && isRequester && (
          <span className="text-xs text-gray-400 px-2">申請中</span>
        )}
        {status === 'accepted' && (
          <button onClick={handleRemove} className="text-xs text-red-400 px-2">削除</button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write AddFriendModal** `src/components/friends/AddFriendModal.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onClose: () => void
  myUserId: string
}

export function AddFriendModal({ onClose, myUserId }: Props) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'search' | 'qr'>('search')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSend() {
    if (!query.trim()) return
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUsername: query.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setMessage('フレンド申請を送りました！')
      router.refresh()
    } else {
      setMessage(data.error ?? 'エラーが発生しました')
    }
  }

  return (
    <div className="fixed inset-0 z-[700] bg-black/40 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">フレンドを追加</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab('search')} className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>検索</button>
          <button onClick={() => setTab('qr')} className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'qr' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>QRコード</button>
        </div>

        {tab === 'search' && (
          <div className="space-y-3">
            <Input
              placeholder="ユーザー名またはID"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            {message && <p className="text-sm text-center text-gray-600">{message}</p>}
            <Button className="w-full" onClick={handleSend} disabled={loading || !query.trim()}>
              {loading ? '送信中...' : '申請を送る'}
            </Button>
          </div>
        )}

        {tab === 'qr' && (
          <div>
            {/* Lazy load QRCodeDisplay to avoid SSR issues */}
            <div className="flex flex-col items-center gap-3 p-4">
              <p className="text-sm text-gray-500">自分のQRコードを見せてスキャンしてもらう</p>
              {/* QRCodeDisplay is dynamically imported below */}
              <QRWrapper userId={myUserId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QRWrapper({ userId }: { userId: string }) {
  const { QRCodeSVG } = require('qrcode.react')
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${userId}` : ''
  if (!profileUrl) return null
  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeSVG value={profileUrl} size={180} />
      <button
        onClick={() => navigator.clipboard.writeText(profileUrl)}
        className="text-sm text-blue-600 underline"
      >
        リンクをコピー
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/friends/
git commit -m "feat: friend card and add friend modal with QR code"
```

---

## Task 4: Friends Page

**Files:**
- Create: `src/app/friends/page.tsx`

- [ ] **Step 1: Write friends page** `src/app/friends/page.tsx`

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FriendsPageClient } from '@/components/friends/FriendsPageClient'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: friendships } = await supabase
    .from('friendships')
    .select('id, status, requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const friendIds = (friendships ?? [])
    .filter(f => f.status === 'accepted')
    .map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id)

  const { data: profiles } = friendIds.length > 0
    ? await supabase.from('user_profiles').select('id, username, level').in('id', friendIds)
    : { data: [] }

  const enriched = (friendships ?? []).map(f => {
    const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id
    const profile = profiles?.find(p => p.id === friendId)
    return {
      friendshipId: f.id,
      userId: friendId,
      username: profile?.username ?? '不明',
      level: profile?.level ?? 1,
      status: f.status as 'pending' | 'accepted' | 'rejected',
      isRequester: f.requester_id === user.id,
    }
  }).filter(f => f.status !== 'rejected')

  return <FriendsPageClient friendships={enriched} myUserId={user.id} />
}
```

- [ ] **Step 2: Create FriendsPageClient** `src/components/friends/FriendsPageClient.tsx`

```tsx
'use client'

import { useState } from 'react'
import { FriendCard } from './FriendCard'
import { AddFriendModal } from './AddFriendModal'
import { Button } from '@/components/ui/button'

interface FriendItem {
  friendshipId: string
  userId: string
  username: string
  level: number
  status: 'pending' | 'accepted' | 'rejected'
  isRequester: boolean
}

interface Props {
  friendships: FriendItem[]
  myUserId: string
}

export function FriendsPageClient({ friendships, myUserId }: Props) {
  const [showModal, setShowModal] = useState(false)

  const accepted = friendships.filter(f => f.status === 'accepted')
  const pending = friendships.filter(f => f.status === 'pending')

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">フレンド</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>+ 追加</Button>
      </div>

      {pending.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-blue-600 mb-2">フレンド申請 ({pending.length})</h2>
          <div className="divide-y divide-blue-100">
            {pending.map(f => <FriendCard key={f.friendshipId} {...f} />)}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">フレンド ({accepted.length})</h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">まだフレンドがいません</p>
        ) : (
          <div className="divide-y">
            {accepted.map(f => <FriendCard key={f.friendshipId} {...f} />)}
          </div>
        )}
      </div>

      {showModal && <AddFriendModal onClose={() => setShowModal(false)} myUserId={myUserId} />}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/friends/ src/components/friends/
git commit -m "feat: friends page with add, accept, reject flow"
```

---

## Task 5: Friend Map Layer

**Files:**
- Create: `src/components/map/FriendLayer.tsx`
- Modify: `src/components/map/MapView.tsx`
- Modify: `src/app/map/page.tsx`

- [ ] **Step 1: Write FriendLayer data fetcher** (server-side, in map page)

Modify `src/app/map/page.tsx` — add friend check-in data:

```tsx
// After existing queries, add:
let friendCheckins: { locationId: string; userId: string; username: string; color: string }[] = []
if (user) {
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted')

  const friendIds = (friendships ?? []).map(f =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  )

  if (friendIds.length > 0) {
    const { data: friendProfiles } = await supabase
      .from('user_profiles')
      .select('id, username')
      .in('id', friendIds)

    const FRIEND_COLORS = ['#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1']

    const { data: fCheckins } = await supabase
      .from('checkins')
      .select('location_id, user_id')
      .in('user_id', friendIds)
      .eq('is_first', true)

    friendCheckins = (fCheckins ?? []).map((c, i) => {
      const profile = friendProfiles?.find(p => p.id === c.user_id)
      const colorIdx = friendIds.indexOf(c.user_id) % FRIEND_COLORS.length
      return {
        locationId: c.location_id,
        userId: c.user_id,
        username: profile?.username ?? '?',
        color: FRIEND_COLORS[colorIdx],
      }
    })
  }
}
```

Pass `friendCheckins` as a prop to `<MapView>`.

- [ ] **Step 2: Add friend mode to MapView**

In `src/components/map/MapView.tsx`, add props and state:

```tsx
// Add to Props interface:
friendCheckins: { locationId: string; userId: string; username: string; color: string }[]

// Add state in component:
const [friendModeOn, setFriendModeOn] = useState(false)

// Add toggle button (absolute positioned, top-right):
{friendCheckins.length > 0 && (
  <button
    onClick={() => setFriendModeOn(v => !v)}
    className={`absolute top-4 right-4 z-[500] px-3 py-2 rounded-xl text-sm font-medium shadow transition-colors ${
      friendModeOn ? 'bg-purple-600 text-white' : 'bg-white/90 text-gray-600'
    }`}
  >
    👥 フレンド
  </button>
)}
```

In the `initMap` function, after adding the main cluster group, add friend markers:

```tsx
// Friend check-in markers (small dots, no clustering)
if (friendModeOn) {
  const friendCheckinMap: Record<string, { color: string; names: string[] }> = {}
  friendCheckins.forEach(fc => {
    if (!friendCheckinMap[fc.locationId]) {
      friendCheckinMap[fc.locationId] = { color: fc.color, names: [] }
    }
    friendCheckinMap[fc.locationId].names.push(fc.username)
  })

  Object.entries(friendCheckinMap).forEach(([locId, info]) => {
    const loc = locations.find(l => l.id === locId)
    if (!loc) return
    const friendIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${info.color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: '',
    })
    L.marker([loc.lat, loc.lng], { icon: friendIcon })
      .bindPopup(`<div style="padding:8px 12px"><strong>${loc.name}</strong><br/><span style="font-size:11px;color:#666">${info.names.join(', ')} が訪問</span></div>`, { closeButton: false })
      .addTo(map)
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/map/ src/app/map/
git commit -m "feat: friend map mode — overlay all friends' check-ins"
```

---

## Task 6: Leaderboard

**Files:**
- Create: `src/app/leaderboard/page.tsx`
- Create: `src/components/leaderboard/LeaderboardTabs.tsx`
- Create: `src/components/leaderboard/LeaderboardTable.tsx`

- [ ] **Step 1: Write LeaderboardTable** `src/components/leaderboard/LeaderboardTable.tsx`

```tsx
import Link from 'next/link'

interface Entry {
  rank: number
  userId: string
  username: string
  level: number
  value: number
  isMe: boolean
}

interface Props {
  entries: Entry[]
  unit: string
}

export function LeaderboardTable({ entries, unit }: Props) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-1">
      {entries.map(entry => (
        <Link
          key={entry.userId}
          href={`/profile/${entry.userId}`}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            entry.isMe ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <span className="w-7 text-center text-sm font-bold text-gray-400">
            {entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}
          </span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {entry.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{entry.username}</p>
            <p className="text-xs text-gray-400">Lv {entry.level}</p>
          </div>
          <span className="text-sm font-bold text-gray-700">
            {entry.value.toLocaleString()} <span className="text-xs text-gray-400">{unit}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write leaderboard page** `src/app/leaderboard/page.tsx`

```tsx
import { createClient } from '@/lib/supabase/server'
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Global XP leaderboard
  const { data: xpRanking } = await supabase
    .from('user_profiles')
    .select('id, username, total_xp, level')
    .order('total_xp', { ascending: false })
    .limit(50)

  // Global check-in count leaderboard
  const { data: checkinCounts } = await supabase
    .from('checkins')
    .select('user_id')
    .eq('is_first', true)

  const checkinCountMap: Record<string, number> = {}
  checkinCounts?.forEach(c => {
    checkinCountMap[c.user_id] = (checkinCountMap[c.user_id] ?? 0) + 1
  })

  // Global badge count leaderboard
  const { data: badgeCounts } = await supabase
    .from('user_badges')
    .select('user_id')

  const badgeCountMap: Record<string, number> = {}
  badgeCounts?.forEach(b => {
    badgeCountMap[b.user_id] = (badgeCountMap[b.user_id] ?? 0) + 1
  })

  // Get friend IDs for friends leaderboard
  let friendIds: string[] = []
  if (user) {
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')
    friendIds = [
      ...(friendships ?? []).map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id),
      ...(user ? [user.id] : []),
    ]
  }

  const profileMap = Object.fromEntries((xpRanking ?? []).map(p => [p.id, p]))

  function buildRanking(
    userIds: string[],
    getValue: (id: string) => number
  ) {
    return userIds
      .map(id => ({
        userId: id,
        username: profileMap[id]?.username ?? '不明',
        level: profileMap[id]?.level ?? 1,
        value: getValue(id),
        isMe: id === user?.id,
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, i) => ({ ...entry, rank: i + 1 }))
  }

  const allIds = (xpRanking ?? []).map(p => p.id)

  const globalXp = buildRanking(allIds, id => profileMap[id]?.total_xp ?? 0)
  const globalCheckins = buildRanking(allIds, id => checkinCountMap[id] ?? 0)
  const globalBadges = buildRanking(allIds, id => badgeCountMap[id] ?? 0)

  const friendsXp = buildRanking(friendIds, id => profileMap[id]?.total_xp ?? 0)
  const friendsCheckins = buildRanking(friendIds, id => checkinCountMap[id] ?? 0)
  const friendsBadges = buildRanking(friendIds, id => badgeCountMap[id] ?? 0)

  return (
    <LeaderboardTabs
      globalXp={globalXp}
      globalCheckins={globalCheckins}
      globalBadges={globalBadges}
      friendsXp={friendsXp}
      friendsCheckins={friendsCheckins}
      friendsBadges={friendsBadges}
      isLoggedIn={!!user}
    />
  )
}
```

- [ ] **Step 3: Write LeaderboardTabs** `src/components/leaderboard/LeaderboardTabs.tsx`

```tsx
'use client'

import { useState } from 'react'
import { LeaderboardTable } from './LeaderboardTable'

interface Entry {
  rank: number
  userId: string
  username: string
  level: number
  value: number
  isMe: boolean
}

interface Props {
  globalXp: Entry[]
  globalCheckins: Entry[]
  globalBadges: Entry[]
  friendsXp: Entry[]
  friendsCheckins: Entry[]
  friendsBadges: Entry[]
  isLoggedIn: boolean
}

type MetricTab = 'xp' | 'checkins' | 'badges'
type ScopeTab = 'global' | 'friends'

export function LeaderboardTabs(props: Props) {
  const [metric, setMetric] = useState<MetricTab>('xp')
  const [scope, setScope] = useState<ScopeTab>('global')

  const METRICS: { key: MetricTab; label: string; unit: string }[] = [
    { key: 'xp', label: 'XP', unit: 'XP' },
    { key: 'checkins', label: '打卡数', unit: '回' },
    { key: 'badges', label: 'バッジ', unit: '個' },
  ]

  const dataMap: Record<ScopeTab, Record<MetricTab, Entry[]>> = {
    global: { xp: props.globalXp, checkins: props.globalCheckins, badges: props.globalBadges },
    friends: { xp: props.friendsXp, checkins: props.friendsCheckins, badges: props.friendsBadges },
  }

  const currentData = dataMap[scope][metric]
  const currentUnit = METRICS.find(m => m.key === metric)!.unit

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">ランキング</h1>

      {/* Scope tabs */}
      <div className="flex gap-2">
        {(['global', 'friends'] as ScopeTab[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              scope === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {s === 'global' ? '🌏 全体' : '👥 フレンド'}
          </button>
        ))}
      </div>

      {/* Metric tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              metric === m.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!props.isLoggedIn && scope === 'friends' ? (
        <p className="text-center text-gray-400 text-sm py-8">ログインするとフレンドランキングが見られます</p>
      ) : currentData.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">データがありません</p>
      ) : (
        <LeaderboardTable entries={currentData} unit={currentUnit} />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/leaderboard/ src/components/leaderboard/
git commit -m "feat: leaderboard — XP, check-ins, badges × global and friends"
```

---

## Task 7: Verify

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify friends page**

Open http://localhost:3000/friends — should render friend list (empty) and add friend modal.

- [ ] **Step 3: Test friend request flow**

Create a second test account. Send a friend request from account 1 to account 2 by username. Log into account 2 and accept. Verify both accounts show each other.

- [ ] **Step 4: Verify leaderboard**

Open http://localhost:3000/leaderboard — global rankings should show registered users.

- [ ] **Step 5: Verify friend map mode**

With two accounts who are friends, log into account 1 and check into a 四極点 location. Log into account 2, open /map, toggle 👥 フレンド — should see a small colored dot at the location account 1 checked in.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: social and leaderboard complete"
```
