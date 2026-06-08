# 編輯個人資料 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓使用者在 `/profile` 頁面透過 modal 編輯使用者名稱和上傳頭像。

**Architecture:** 新增 `avatar_url` 欄位到 `user_profiles`，複用現有 R2 上傳 API，新增 `EditProfileModal` 元件，更新所有顯示使用者頭像的元件（ProfileHeader、LeaderboardTable、FriendCard）。

**Tech Stack:** Next.js 16, Supabase, Cloudflare R2 (via @aws-sdk/client-s3), React 19, Tailwind CSS 4, browser-image-compression

---

## File Structure

| 動作 | 路徑 | 用途 |
|------|------|------|
| Create | `supabase/migrations/20260605200000_add_avatar_url.sql` | 新增 avatar_url 欄位 |
| Modify | `src/types/database.ts` | 型別同步 |
| Modify | `src/lib/i18n/dictionaries/ja.json` | 日文翻譯 |
| Modify | `src/lib/i18n/dictionaries/en.json` | 英文翻譯 |
| Modify | `src/lib/i18n/dictionaries/zh.json` | 中文翻譯 |
| Modify | `src/app/api/upload/route.ts` | 支援 avatar 上傳路徑 |
| Create | `src/components/profile/UserAvatar.tsx` | 共用頭像元件 |
| Create | `src/components/profile/EditProfileModal.tsx` | 編輯個人資料 modal |
| Modify | `src/components/profile/ProfilePageClient.tsx` | 加入編輯按鈕與 modal |
| Modify | `src/components/profile/ProfileHeader.tsx` | 使用 UserAvatar 元件 |
| Modify | `src/app/profile/page.tsx` | 傳遞 avatar_url |
| Modify | `src/app/profile/[userId]/page.tsx` | 傳遞 avatar_url |
| Modify | `src/components/leaderboard/LeaderboardTable.tsx` | 使用 UserAvatar |
| Modify | `src/app/leaderboard/page.tsx` | 查詢 avatar_url |
| Modify | `src/components/friends/FriendCard.tsx` | 使用 UserAvatar |
| Modify | `src/app/friends/page.tsx` | 查詢 avatar_url |

---

### Task 1: 資料庫 Migration — 新增 avatar_url 欄位

**Files:**
- Create: `supabase/migrations/20260605200000_add_avatar_url.sql`

- [ ] **Step 1: 建立 migration 檔案**

```sql
ALTER TABLE user_profiles ADD COLUMN avatar_url text;
```

- [ ] **Step 2: 套用 migration**

Run: `npx supabase db push`（或透過 Supabase MCP tool `apply_migration`）

---

### Task 2: 更新 TypeScript 型別

**Files:**
- Modify: `src/types/database.ts:38-49`

- [ ] **Step 1: 在 user_profiles Row 加入 avatar_url**

在 `user_profiles.Row` 的 `active_title_id` 之後加入：

```typescript
avatar_url: string | null
```

完整的 `user_profiles` 型別應為：

```typescript
user_profiles: {
  Row: {
    id: string
    username: string
    total_xp: number
    level: number
    active_title_id: string | null
    avatar_url: string | null
    created_at: string
  }
  Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at'>
  Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
}
```

- [ ] **Step 2: 確認型別檢查通過**

Run: `npx tsc --noEmit`

---

### Task 3: 新增 i18n 翻譯

**Files:**
- Modify: `src/lib/i18n/dictionaries/ja.json:138-155`
- Modify: `src/lib/i18n/dictionaries/en.json:138-155`
- Modify: `src/lib/i18n/dictionaries/zh.json:138-155`

- [ ] **Step 1: 在三個語言檔的 `profile` 區塊新增鍵值**

**ja.json** — 在 `"globalRank": "全站順位"` 之後加入：

```json
"edit": "プロフィールを編集",
"changeAvatar": "アバターを変更",
"username": "ユーザー名",
"save": "保存",
"saving": "保存中...",
"saveSuccess": "保存しました",
"usernameTooLong": "ユーザー名は20文字以内にしてください",
"uploadFailed": "アップロードに失敗しました"
```

**en.json** — 在 `"globalRank": "Global Rank"` 之後加入：

```json
"edit": "Edit Profile",
"changeAvatar": "Change Avatar",
"username": "Username",
"save": "Save",
"saving": "Saving...",
"saveSuccess": "Saved successfully",
"usernameTooLong": "Username must be 20 characters or less",
"uploadFailed": "Upload failed"
```

**zh.json** — 在 `"globalRank": "全站排名"` 之後加入：

```json
"edit": "編輯個人資料",
"changeAvatar": "變更頭像",
"username": "使用者名稱",
"save": "儲存",
"saving": "儲存中...",
"saveSuccess": "儲存成功",
"usernameTooLong": "使用者名稱不能超過20字",
"uploadFailed": "上傳失敗"
```

---

### Task 4: 修改上傳 API 支援 avatar 路徑

**Files:**
- Modify: `src/app/api/upload/route.ts`

- [ ] **Step 1: 調整 upload route 支援 type 參數**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToR2 } from '@/lib/r2/client'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const type = formData.get('type') as string | null

  const buffer = Buffer.from(await file.arrayBuffer())

  let key: string
  if (type === 'avatar') {
    key = `avatars/${user.id}.webp`
  } else {
    const ext = file.type === 'image/jpeg' ? 'jpg' : 'webp'
    key = `checkins/${user.id}/${randomUUID()}.${ext}`
  }

  const url = await uploadToR2(key, buffer, file.type)
  return NextResponse.json({ url })
}
```

---

### Task 5: 建立共用 UserAvatar 元件

**Files:**
- Create: `src/components/profile/UserAvatar.tsx`

- [ ] **Step 1: 建立 UserAvatar 元件**

```tsx
'use client'

interface Props {
  username: string
  avatarUrl?: string | null
  size?: number
  rounded?: 'full' | 'rounded'
  className?: string
}

export function UserAvatar({ username, avatarUrl, size = 48, rounded = 'full', className = '' }: Props) {
  const radius = rounded === 'full' ? '50%' : '14px'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    )
  }

  return (
    <span
      className={`grid place-items-center font-bold text-white flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.42,
        background: 'linear-gradient(160deg, #aec1ce, #dde6ea)',
        color: 'var(--ink2)',
      }}
    >
      {username[0]?.toUpperCase() ?? '?'}
    </span>
  )
}
```

---

### Task 6: 建立 EditProfileModal 元件

**Files:**
- Create: `src/components/profile/EditProfileModal.tsx`

- [ ] **Step 1: 建立 EditProfileModal**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDictionary } from '@/lib/i18n/context'
import { UserAvatar } from './UserAvatar'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface Props {
  userId: string
  currentUsername: string
  currentAvatarUrl: string | null
  onClose: () => void
}

export function EditProfileModal({ userId, currentUsername, currentAvatarUrl, onClose }: Props) {
  const router = useRouter()
  const dict = useDictionary()
  const [visible, setVisible] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const { default: imageCompression } = await import('browser-image-compression')
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: 'image/webp',
      })

      const formData = new FormData()
      formData.append('file', compressed, 'avatar.webp')
      formData.append('type', 'avatar')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error()

      const { url } = await res.json()
      setAvatarUrl(url)
    } catch {
      toast.error(dict.profile.uploadFailed)
      setAvatarPreview(null)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (username.length > 20) {
      toast.error(dict.profile.usernameTooLong)
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ username, avatar_url: avatarUrl })
      .eq('id', userId)

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success(dict.profile.saveSuccess)
    setSaving(false)
    handleClose()
    router.refresh()
  }

  const displayAvatarUrl = avatarPreview ?? avatarUrl

  return (
    <div className="fixed inset-0 z-[700]">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(36,52,74,.34)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-paper rounded-t-[22px] transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '92%', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[38px] h-1 rounded-[2px]" style={{ background: '#d8d0bf' }} />
        </div>

        <div className="flex items-center justify-between px-[18px] pt-2 pb-4">
          <h2 className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {dict.profile.edit}
          </h2>
          <button className="sm-iconbtn" onClick={handleClose}>
            <X size={18} className="text-sub" />
          </button>
        </div>

        <div className="px-[18px] pb-8 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <UserAvatar
              username={username}
              avatarUrl={displayAvatarUrl}
              size={80}
              rounded="full"
            />
            <label className="text-[13px] font-semibold cursor-pointer" style={{ color: 'var(--green-d)' }}>
              {uploading ? '...' : dict.profile.changeAvatar}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Username */}
          <div>
            <label className="text-[12px] text-sub font-bold block mb-[6px]">
              {dict.profile.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-[10px] rounded-[10px] text-[14px] bg-paper2 border border-line focus:outline-none focus:border-green"
            />
            <div className="text-right text-[11px] text-sub mt-1">{username.length}/20</div>
          </div>

          {/* Save */}
          <button
            className="sm-btn sm-btn-primary"
            onClick={handleSave}
            disabled={saving || uploading || !username.trim()}
            style={(saving || uploading || !username.trim()) ? { opacity: 0.45 } : undefined}
          >
            {saving ? dict.profile.saving : dict.profile.save}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### Task 7: 整合 Modal 到 ProfilePageClient

**Files:**
- Modify: `src/components/profile/ProfilePageClient.tsx`

- [ ] **Step 1: 加入 EditProfileModal 與編輯按鈕**

```tsx
'use client'

import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { BadgeWall } from './BadgeWall'
import { TitleSelector } from './TitleSelector'
import { CategoryProgressList } from './CategoryProgressList'
import { EditProfileModal } from './EditProfileModal'
import { useDictionary } from '@/lib/i18n/context'
import { Pencil } from 'lucide-react'

interface Props {
  profile: any
  earnedBadges: any[]
  allBadges: any[]
  earnedTitles: any[]
  categoryProgress: any[]
  totalCheckins: number
  totalSpots: number
}

export function ProfilePageClient({ profile, earnedBadges, allBadges, earnedTitles, categoryProgress, totalCheckins, totalSpots }: Props) {
  const dict = useDictionary()
  const [showEdit, setShowEdit] = useState(false)

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4 space-y-[13px]">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.profile.status}</h1>
        <button className="sm-iconbtn" onClick={() => setShowEdit(true)}>
          <Pencil size={16} className="text-sub" />
        </button>
      </div>
      <ProfileHeader
        username={profile?.username ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
        totalXp={profile?.total_xp ?? 0}
        level={profile?.level ?? 1}
        activeTitle={profile?.titles?.name}
        totalCheckins={totalCheckins}
        totalBadges={earnedBadges.length}
        totalSpots={totalSpots}
      />
      <TitleSelector
        earnedTitles={earnedTitles}
        activeTitleId={profile?.active_title_id ?? null}
      />
      <CategoryProgressList categories={categoryProgress} />
      <BadgeWall earnedBadges={earnedBadges} allBadges={allBadges} />
      {showEdit && (
        <EditProfileModal
          userId={profile?.id}
          currentUsername={profile?.username ?? ''}
          currentAvatarUrl={profile?.avatar_url ?? null}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
```

---

### Task 8: 更新 ProfileHeader 支援頭像

**Files:**
- Modify: `src/components/profile/ProfileHeader.tsx`

- [ ] **Step 1: 加入 avatarUrl prop 並使用 UserAvatar**

在 import 區加入：

```typescript
import { UserAvatar } from './UserAvatar'
```

在 Props interface 加入：

```typescript
avatarUrl?: string | null
```

把原本的頭像 div：

```tsx
<div className="sm-avatar w-[74px] h-[88px] text-[38px] rounded-[11px]">
  {username[0]?.toUpperCase() ?? '?'}
</div>
```

替換成：

```tsx
<UserAvatar
  username={username}
  avatarUrl={avatarUrl}
  size={74}
  rounded="rounded"
  className="h-[88px]"
/>
```

---

### Task 9: 更新 Profile 頁面資料傳遞

**Files:**
- Modify: `src/app/profile/page.tsx`
- Modify: `src/app/profile/[userId]/page.tsx`

- [ ] **Step 1: 更新 `/profile/page.tsx`**

profile 的 select 查詢已經用 `select('*, titles(...)')` 所以 `avatar_url` 會自動被包含，不需要改查詢。`ProfilePageClient` 已透過 `profile` prop 傳遞整個 profile 物件，所以 `avatar_url` 會自動帶到。

不需要修改此檔案。

- [ ] **Step 2: 更新 `/profile/[userId]/page.tsx`**

同上，`select('*, titles(...)')` 已包含所有欄位。需要在 `ProfileHeader` 呼叫處加入 `avatarUrl`：

```tsx
<ProfileHeader
  username={profile.username}
  avatarUrl={profile.avatar_url}
  totalXp={profile.total_xp}
  level={profile.level}
  activeTitle={profile.titles ? localizedName(profile.titles, locale) : null}
/>
```

---

### Task 10: 更新 LeaderboardTable 顯示頭像

**Files:**
- Modify: `src/app/leaderboard/page.tsx:12-15`
- Modify: `src/components/leaderboard/LeaderboardTable.tsx`

- [ ] **Step 1: 修改 leaderboard 頁面查詢加入 avatar_url**

在 `src/app/leaderboard/page.tsx` 中，修改 xpRanking 查詢的 select：

```typescript
const { data: xpRanking } = await supabase
  .from('user_profiles')
  .select('id, username, total_xp, level, avatar_url')
  .order('total_xp', { ascending: false })
  .limit(50) as { data: { id: string; username: string; total_xp: number; level: number; avatar_url: string | null }[] | null; error: unknown }
```

修改 `buildRanking` 函式，在回傳物件加入 `avatarUrl`：

```typescript
function buildRanking(userIds: string[], getValue: (id: string) => number) {
  return userIds
    .map(id => ({
      userId: id,
      username: profileMap[id]?.username ?? dict.common.unknown,
      level: profileMap[id]?.level ?? 1,
      avatarUrl: profileMap[id]?.avatar_url ?? null,
      value: getValue(id),
      isMe: id === user?.id,
    }))
    .sort((a, b) => b.value - a.value)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}
```

- [ ] **Step 2: 修改 LeaderboardTable 使用 UserAvatar**

```tsx
'use client'

import Link from 'next/link'
import { UserAvatar } from '@/components/profile/UserAvatar'

interface Entry {
  rank: number
  userId: string
  username: string
  avatarUrl: string | null
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
          <UserAvatar
            username={entry.username}
            avatarUrl={entry.avatarUrl}
            size={36}
            rounded="full"
          />
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

---

### Task 11: 更新 FriendCard 顯示頭像

**Files:**
- Modify: `src/app/friends/page.tsx:20-21`
- Modify: `src/components/friends/FriendCard.tsx`

- [ ] **Step 1: 修改 friends 頁面查詢加入 avatar_url**

在 `src/app/friends/page.tsx`，修改 profiles 查詢的 select：

```typescript
const { data: profiles } = friendIds.length > 0
  ? await supabase.from('user_profiles').select('id, username, level, avatar_url').in('id', friendIds) as any
  : { data: [] }
```

在 `enriched` map 中加入 `avatarUrl`：

```typescript
const enriched = ((friendships ?? []) as any[]).map((f: any) => {
  const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id
  const profile = (profiles as any[])?.find((p: any) => p.id === friendId)
  return {
    friendshipId: f.id,
    userId: friendId,
    username: profile?.username ?? '?',
    level: profile?.level ?? 1,
    avatarUrl: profile?.avatar_url ?? null,
    status: f.status as 'pending' | 'accepted' | 'rejected',
    isRequester: f.requester_id === user.id,
  }
}).filter((f: any) => f.status !== 'rejected')
```

- [ ] **Step 2: 修改 FriendCard 使用 UserAvatar**

在 import 區加入：

```typescript
import { UserAvatar } from '@/components/profile/UserAvatar'
```

在 Props interface 加入：

```typescript
avatarUrl?: string | null
```

把 pending 狀態中的首字母頭像：

```tsx
<span
  className="w-[46px] h-[46px] rounded-full text-[19px] text-white grid place-items-center font-bold"
  style={{ background: color }}
>
  {username[0]?.toUpperCase()}
</span>
```

替換成：

```tsx
<UserAvatar username={username} avatarUrl={avatarUrl} size={46} rounded="full" />
```

把 accepted 狀態中的首字母頭像：

```tsx
<span
  className="w-[50px] h-[50px] rounded-[14px] text-[21px] text-white grid place-items-center font-bold"
  style={{ background: color }}
>
  {username[0]?.toUpperCase()}
</span>
```

替換成：

```tsx
<UserAvatar username={username} avatarUrl={avatarUrl} size={50} rounded="rounded" />
```

在 `FriendsPageClient` 傳遞 `avatarUrl` prop 時也要確認有帶入。

---

### Task 12: 驗證與提交

- [ ] **Step 1: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 無錯誤

- [ ] **Step 2: 開發伺服器測試**

Run: `npm run dev`

測試項目：
1. `/profile` 頁面顯示編輯按鈕（鉛筆圖示）
2. 點擊編輯按鈕 → modal 從底部滑出
3. 可以修改使用者名稱（字數計數器顯示正確）
4. 點「變更頭像」可以選圖 → 即時預覽
5. 點「儲存」→ 成功 toast → modal 關閉 → 頁面更新
6. `/profile/[userId]` 公開頁面顯示頭像
7. 排行榜顯示頭像
8. 好友列表顯示頭像
9. 沒上傳頭像時維持首字母頭像

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260605200000_add_avatar_url.sql src/types/database.ts src/lib/i18n/dictionaries/ src/app/api/upload/route.ts src/components/profile/UserAvatar.tsx src/components/profile/EditProfileModal.tsx src/components/profile/ProfilePageClient.tsx src/components/profile/ProfileHeader.tsx src/app/profile/ src/components/leaderboard/LeaderboardTable.tsx src/app/leaderboard/page.tsx src/components/friends/FriendCard.tsx src/app/friends/page.tsx
git commit -m "feat: edit profile modal with avatar upload and username editing"
```
