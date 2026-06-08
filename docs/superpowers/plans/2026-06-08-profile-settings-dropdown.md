# Profile Settings Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將個人頁面右上角的鉛筆按鈕改成設定齒輪，點擊後展開 dropdown，dropdown 內有「編輯個人檔案」選項。

**Architecture:** 在 `ProfilePageClient.tsx` 加入 `showDropdown` state 與 `useRef`，透過 `useEffect` 監聽 `mousedown` 實現點擊外側關閉。Dropdown 用 absolute 定位，右對齊按鈕。

**Tech Stack:** React 19, Tailwind CSS, lucide-react

---

### Task 1: 修改 ProfilePageClient.tsx

**Files:**
- Modify: `src/components/profile/ProfilePageClient.tsx`

- [ ] **Step 1: 將整個檔案替換為以下內容**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { TitleSelector } from './TitleSelector'
import { CategoryProgressList } from './CategoryProgressList'
import { EditProfileModal } from './EditProfileModal'
import { useDictionary } from '@/lib/i18n/context'
import { Settings } from 'lucide-react'

interface Props {
  profile: any
  earnedTitles: any[]
  categoryProgress: any[]
  totalCheckins: number
  totalSpots: number
}

export function ProfilePageClient({ profile, earnedTitles, categoryProgress, totalCheckins, totalSpots }: Props) {
  const dict = useDictionary()
  const [showEdit, setShowEdit] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4 space-y-[13px]">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.profile.status}</h1>
        <div className="relative" ref={dropdownRef}>
          <button className="sm-iconbtn" onClick={() => setShowDropdown(v => !v)}>
            <Settings size={16} className="text-sub" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-paper border border-line rounded-[11px] shadow-md py-1 min-w-[140px] z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-paper2 transition-colors rounded-[10px]"
                onClick={() => { setShowDropdown(false); setShowEdit(true) }}
              >
                {dict.profile.edit}
              </button>
            </div>
          )}
        </div>
      </div>
      <ProfileHeader
        username={profile?.username ?? ''}
        userCode={profile?.user_code ?? undefined}
        avatarUrl={profile?.avatar_url ?? null}
        totalXp={profile?.total_xp ?? 0}
        level={profile?.level ?? 1}
        activeTitle={profile?.titles?.name}
        totalCheckins={totalCheckins}
        totalTitles={earnedTitles.length}
        totalSpots={totalSpots}
      />
      <TitleSelector
        earnedTitles={earnedTitles}
        activeTitleId={profile?.active_title_id ?? null}
      />
      <CategoryProgressList categories={categoryProgress} />
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

- [ ] **Step 2: 確認 TypeScript 無錯誤**

```powershell
cd C:\Users\Panda\Desktop\sutamap
npx tsc --noEmit
```

Expected: 無任何錯誤輸出

- [ ] **Step 3: Commit**

```bash
git add src/components/profile/ProfilePageClient.tsx
git commit -m "feat: replace edit button with settings dropdown on profile page"
```
