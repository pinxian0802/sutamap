# 主題詳細頁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在「主題一覽」(`/categories`) 點擊任一主題，開啟該主題詳細頁，介紹主題並在內嵌唯讀地圖上標出其所有地點。

**Architecture:** 沿用既有 `categories`/`locations`/`checkins` 資料表，不新增資料表。新增 server route `/categories/[id]` 抓資料 → client 元件 `CategoryDetailClient` 排版 → 重用既有 `MapView`（新增鎖定+唯讀+內嵌+聚焦模式）。`/categories` 列表卡片改為可點擊導向詳細頁。

**Tech Stack:** Next.js 16 (App Router, async `params`)、React 19、Supabase SSR、Leaflet、Tailwind v4、i18n（`useDictionary` / `localizedName`）。

**驗證方式：** 本專案無測試框架（無 test script、無測試檔、`playwright` 為未使用的 devDep）。每個 Task 以 `npm run build`（型別/編譯檢查）+ 執行 `npm run dev`（port 4000）做 runtime 驗證，符合 repo 既有實務。

**Commit 政策：** 使用者要求暫時不要 commit。每個 Task 結尾只做 build 驗證，**不要執行 `git commit`**。全部完成、使用者確認後再一次提交。

---

## File Structure

- **Modify** `src/lib/i18n/dictionaries/{ja,en,zh}.json` — 新增詳細頁文字（`categories.locationsList`、`categories.emptyLocations`）。
- **Modify** `src/components/map/MapView.tsx` — 新增 `lockedCategoryId` / `focusLocationId` / `embedded` props（鎖定單一主題、唯讀、內嵌高度、清單聚焦）。不影響主地圖既有行為。
- **Modify** `src/components/categories/CategoryCard.tsx` — 整張卡片可點擊導向 `/categories/[id]`；好友頭像 `stopPropagation`。
- **Create** `src/components/categories/CategoryDetailClient.tsx` — 詳細頁版面（介紹+統計、進度條、內嵌地圖、地點清單、好友進度），持有 `focusLocationId` 串接清單與地圖。
- **Create** `src/app/categories/[id]/page.tsx` — server component，依 `params.id` 抓主題/地點/打卡/好友並在地化。

---

## Task 1: 新增 i18n 字典 key

**Files:**
- Modify: `src/lib/i18n/dictionaries/zh.json`
- Modify: `src/lib/i18n/dictionaries/en.json`
- Modify: `src/lib/i18n/dictionaries/ja.json`

說明：詳細頁的統計（總點數/已打卡/XP）沿用既有 key（`categories.spots`、`map.visited`、`categories.xpPerSpot`），進度條沿用既有 `categories.collectionProgress`，好友區塊沿用 `categories.friendsWorking`。本 Task 只新增兩個新 key。

- [ ] **Step 1: 在 `zh.json` 的 `categories` 物件新增兩個 key**

把 `categories` 區塊（目前最後一個 key 是 `"collectionProgress": "蒐集進度"`）改成：

```json
  "categories": {
    "title": "主題一覽",
    "complete": "★ 完成",
    "spots": "處",
    "xpPerSpot": "XP/處",
    "friendsWorking": "好友也在挑戰中",
    "collectionProgress": "蒐集進度",
    "locationsList": "地點清單",
    "emptyLocations": "這個主題還沒有地點"
  },
```

- [ ] **Step 2: 在 `en.json` 的 `categories` 物件新增相同 key**

```json
  "categories": {
    "title": "Categories",
    "complete": "★ Complete",
    "spots": "spots",
    "xpPerSpot": "XP/spot",
    "friendsWorking": "Friends also working on this",
    "collectionProgress": "Collection progress",
    "locationsList": "Locations",
    "emptyLocations": "No spots in this theme yet"
  },
```

- [ ] **Step 3: 在 `ja.json` 的 `categories` 物件新增相同 key**

```json
  "categories": {
    "title": "テーマ一覧",
    "complete": "★ クリア",
    "spots": "箇所",
    "xpPerSpot": "XP/箇所",
    "friendsWorking": "フレンドも挑戦中",
    "collectionProgress": "コレクション進捗",
    "locationsList": "スポット一覧",
    "emptyLocations": "このテーマにはまだスポットがありません"
  },
```

- [ ] **Step 4: 驗證 JSON 合法且 build 通過**

Run: `node -e "require('./src/lib/i18n/dictionaries/zh.json');require('./src/lib/i18n/dictionaries/en.json');require('./src/lib/i18n/dictionaries/ja.json');console.log('json ok')"`
Expected: 印出 `json ok`（無 JSON parse 錯誤）。

Run: `npm run build`
Expected: build 成功。若 `dictionaries.ts` 對字典型別有嚴格檢查，三檔 key 一致才會過。

> 不要 commit（見 Commit 政策）。

---

## Task 2: MapView 新增鎖定 / 唯讀 / 內嵌 / 聚焦模式

**Files:**
- Modify: `src/components/map/MapView.tsx`

目標：新增三個 optional props，讓詳細頁重用 MapView。主地圖（`/map`）不傳這些 props，行為完全不變。

- `lockedCategoryId?: string` — 只建立並顯示此主題的 marker（不分群、初始 fitBounds）、隱藏 `CategoryFilter`、唯讀（popup 不含打卡按鈕、不顯示打卡 FAB/登入提示/附近面板/打卡 modal）。
- `focusLocationId?: string | null` — 值改變時 fly 到該地點並開啟 popup（供地點清單點擊）。
- `embedded?: boolean` — 根容器用 `h-full`（填滿外層固定高度），而非主地圖的 `h-screen -mb-[56px]`。

- [ ] **Step 1: 擴充 Props 介面與函式簽名**

把 `Props` 介面（`MapView.tsx:33-39`）改為：

```tsx
interface Props {
  locations: Location[]
  categories: Category[]
  userCheckinLocationIds: string[]
  friendCheckins: FriendCheckin[]
  isLoggedIn: boolean
  lockedCategoryId?: string
  focusLocationId?: string | null
  embedded?: boolean
}
```

把函式簽名（`MapView.tsx:41`）改為：

```tsx
export function MapView({ locations, categories, userCheckinLocationIds, friendCheckins, isLoggedIn, lockedCategoryId, focusLocationId, embedded = false }: Props) {
```

- [ ] **Step 2: 鎖定旗標與初始 selected 狀態**

把 `MapView.tsx:50` 的：

```tsx
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
```

改為（並在其上方加入 `locked` 常數）：

```tsx
  const locked = lockedCategoryId != null
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(lockedCategoryId ?? null)
```

- [ ] **Step 3: 在 initMap 的 `locations.forEach` 內做過濾、選擇圖層、唯讀 popup、收集 bounds**

把 `MapView.tsx:98-136`（從 `locations.forEach(loc => {` 到 `map.addLayer(plainGroup)`）整段替換為：

```tsx
      const lockedBounds: [number, number][] = []

      locations.forEach(loc => {
        if (locked && loc.category_id !== lockedCategoryId) return

        const isChecked = checkedSet.has(loc.id)
        const color = loc.categories.color

        const icon = L.divIcon({
          html: `<div style="position:relative">
            <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;background:${isChecked ? color : '#aab2bf'};display:grid;place-items:center;box-shadow:0 4px 8px -2px rgba(45,74,107,.5)">
              <span style="transform:rotate(45deg);font-size:13px">${loc.categories.icon}</span>
            </div>
            ${isChecked ? `<span style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:var(--green,#7aa83c);border:2px solid #fff;display:grid;place-items:center;z-index:2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
            </span>` : ''}
            <span style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:3px;font-size:10px;font-weight:700;white-space:nowrap;color:var(--ink,#2d4a6b);background:rgba(251,248,241,.88);padding:2px 6px;border-radius:6px;border:1px solid var(--line,#e0d9c8);pointer-events:none">${loc.name}</span>
          </div>`,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -42],
          className: '',
        })

        const marker = L.marker([loc.lat, loc.lng], { icon })

        const popupHtml = locked
          ? `
            <div style="padding:12px 16px;min-width:160px;font-family:var(--font-sans,'Zen Kaku Gothic New',sans-serif)">
              <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:4px">${loc.categories.name}</div>
              <div style="font-size:15px;font-weight:700;color:#2d4a6b">${loc.name}</div>
            </div>
          `
          : `
            <div style="padding:12px 16px;min-width:160px;font-family:var(--font-sans,'Zen Kaku Gothic New',sans-serif)">
              <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:4px">${loc.categories.name}</div>
              <div style="font-size:15px;font-weight:700;color:#2d4a6b;margin-bottom:8px">${loc.name}</div>
              <button
                onclick="document.dispatchEvent(new CustomEvent('open-checkin',{detail:{id:'${loc.id}'}}))"
                style="width:100%;padding:8px;background:#7aa83c;color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 10px -4px rgba(122,168,60,.7)"
              >${isChecked ? dict.map.revisit : dict.map.checkin}</button>
            </div>
          `

        marker.bindPopup(popupHtml, { closeButton: false })

        markersRef.current.set(loc.id, { marker, categoryId: loc.category_id })

        if (locked) {
          plainGroup.addLayer(marker)
          lockedBounds.push([loc.lat, loc.lng])
        } else {
          clusterGroup.addLayer(marker)
        }
      })

      map.addLayer(clusterGroup)
      map.addLayer(plainGroup)

      if (locked && lockedBounds.length > 0) {
        map.fitBounds(L.latLngBounds(lockedBounds), { padding: [50, 50], maxZoom: 14, duration: 0 })
      }
```

> 註：在鎖定模式下 `CategoryFilter` 被隱藏，`selectedCategoryId` 永遠等於 `lockedCategoryId` 不會變動；既有的「filter markers」effect（`MapView.tsx:160-188`）在掛載時因 `clusterRef` 尚未就緒會 early-return，之後不再觸發，所以不會干擾 initMap 放進 `plainGroup` 的 marker。

- [ ] **Step 4: 新增 focusLocationId 聚焦 effect**

在 friend overlay effect 之後（`MapView.tsx:232` 那個 `}, [...])` 結束之後、`return (` 之前）插入：

```tsx
  // Fly to a specific location (used by the detail page location list)
  useEffect(() => {
    if (!focusLocationId) return
    const map = mapInstanceRef.current
    const entry = markersRef.current.get(focusLocationId)
    if (!map || !entry) return
    const ll = entry.marker.getLatLng()
    map.flyTo(ll, Math.max(map.getZoom(), 14), { duration: 0.8 })
    entry.marker.openPopup()
  }, [focusLocationId])
```

> 註：重複點擊同一筆（focusLocationId 不變）不會重新 fly，這是可接受的 UX。

- [ ] **Step 5: 根容器高度可切換，並將覆蓋層在鎖定模式下隱藏**

把 `return (` 之後的根 `<div>`（`MapView.tsx:235`）：

```tsx
    <div className="relative w-full h-screen -mb-[56px]">
      <div ref={mapRef} className="w-full h-full" />

      {/* category selector with search */}
      <CategoryFilter
        categories={categories}
        locations={locations}
        selectedId={selectedCategoryId}
        onSelect={selectCategory}
      />
```

改為：

```tsx
    <div className={embedded ? 'relative w-full h-full' : 'relative w-full h-screen -mb-[56px]'}>
      <div ref={mapRef} className="w-full h-full" />

      {/* category selector with search */}
      {!locked && (
        <CategoryFilter
          categories={categories}
          locations={locations}
          selectedId={selectedCategoryId}
          onSelect={selectCategory}
        />
      )}
```

接著把後面四個覆蓋層各自包進 `!locked && (...)`：

  1. checkin FAB 區塊（`{isLoggedIn && (` … `)}`）→ 改成 `{!locked && isLoggedIn && (` … `)}`
  2. 未登入提示區塊（`{!isLoggedIn && (` … `)}`）→ 改成 `{!locked && !isLoggedIn && (` … `)}`
  3. nearby panel（`{nearbyOpen && (` … `)}`）→ 改成 `{!locked && nearbyOpen && (` … `)}`
  4. checkin modal（`{checkinLocationId && (() => {` … `})()}`）→ 改成 `{!locked && checkinLocationId && (() => {` … `})()}`

- [ ] **Step 6: 驗證 build 通過、主地圖未壞**

Run: `npm run build`
Expected: build 成功，無型別錯誤。

Run: `npm run dev`，瀏覽 `http://localhost:4000/map`
Expected: 主地圖行為與先前一致（篩選列、聚類、打卡 FAB、選主題會 fitBounds），確認新增 props 不傳時沒有 regression。

> 不要 commit。

---

## Task 3: 讓主題列表卡片可點擊進入詳細頁

**Files:**
- Modify: `src/components/categories/CategoryCard.tsx`

目標：整張卡片點擊導向 `/categories/[id]`；卡片內好友頭像維持連到個人頁，但點擊時 `stopPropagation` 避免誤觸卡片導航（避免巢狀 `<a>`）。

- [ ] **Step 1: 匯入 useRouter 並讓根容器可點擊**

把檔案頂部 import（`CategoryCard.tsx:1-4`）：

```tsx
'use client'

import Link from 'next/link'
import { useDictionary } from '@/lib/i18n/context'
```

改為：

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/lib/i18n/context'
```

在元件內取得 `dict` 之後（`const dict = useDictionary()` 下一行）新增：

```tsx
  const router = useRouter()
```

把根容器（`CategoryCard.tsx` 的 `<div className="py-[9px]" style={{ borderTop: '1px solid var(--line2)' }}>`）改為可點擊：

```tsx
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/categories/${id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/categories/${id}`) } }}
      className="py-[9px] cursor-pointer"
      style={{ borderTop: '1px solid var(--line2)' }}
    >
```

- [ ] **Step 2: 好友頭像 Link 加 stopPropagation**

把好友頭像的 `<Link>`（`CategoryCard.tsx` 內的 `href={`/profile/${f.userId}`}`）加上 `onClick` 阻擋冒泡：

```tsx
              <Link
                key={f.userId}
                href={`/profile/${f.userId}`}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded-full bg-ink2 text-white text-[9px] font-bold grid place-items-center border border-paper"
              >
                {f.username[0]?.toUpperCase()}
              </Link>
```

- [ ] **Step 3: 驗證 build 與點擊行為**

Run: `npm run build`
Expected: build 成功。

Run: `npm run dev`，瀏覽 `http://localhost:4000/categories`
Expected: 點整張卡片導向 `/categories/<id>`（此時詳細頁 Task 5 可能尚未建立，會 404，屬正常）；點好友頭像導向個人頁、不會誤觸卡片導航。

> 不要 commit。

---

## Task 4: 建立 CategoryDetailClient 版面元件

**Files:**
- Create: `src/components/categories/CategoryDetailClient.tsx`

目標：詳細頁版面，由上到下：主題介紹+統計、進度條、內嵌唯讀地圖、地點清單、好友進度。持有 `focusLocationId` state，點清單項時 fly 地圖並把地圖捲入視野。

- [ ] **Step 1: 建立元件檔**

建立 `src/components/categories/CategoryDetailClient.tsx`，內容：

```tsx
'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check } from 'lucide-react'
import { MapView } from '@/components/map/MapView'
import { useDictionary } from '@/lib/i18n/context'

export interface DetailLocation {
  id: string
  name: string
  prefecture: string | null
  lat: number
  lng: number
  category_id: string
  categories: { id: string; name: string; color: string; icon: string; checkin_radius_meters: number; xp_per_checkin: number }
  checked: boolean
}

export interface DetailFriend {
  userId: string
  username: string
  checked: number
}

export interface DetailCategory {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  xp_per_checkin: number
}

interface Props {
  category: DetailCategory
  locations: DetailLocation[]
  checkedCount: number
  friends: DetailFriend[]
  isLoggedIn: boolean
}

export function CategoryDetailClient({ category, locations, checkedCount, friends, isLoggedIn }: Props) {
  const dict = useDictionary()
  const router = useRouter()
  const mapWrapRef = useRef<HTMLDivElement>(null)
  const [focusLocationId, setFocusLocationId] = useState<string | null>(null)

  const total = locations.length
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0
  const isComplete = checkedCount === total && total > 0

  function handleLocationClick(id: string) {
    setFocusLocationId(id)
    mapWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4">
      {/* back + header */}
      <div className="flex items-center gap-[8px] px-[2px] pt-[6px] pb-[14px]">
        <button onClick={() => router.back()} className="sm-iconbtn" aria-label="back">
          <ChevronLeft size={18} className="text-sub" />
        </button>
        <div className="flex items-center gap-[9px] min-w-0">
          <span
            className="w-[26px] h-[26px] rounded-lg text-white grid place-items-center flex-shrink-0 text-[15px]"
            style={{ background: category.color }}
          >
            {category.icon}
          </span>
          <h1 className="text-[19px] font-bold truncate" style={{ fontFamily: 'var(--font-display)' }}>{category.name}</h1>
        </div>
      </div>

      {/* intro + stats */}
      <div className="sm-card">
        {category.description && (
          <p className="text-[13px] text-sub leading-[1.7] mb-[12px]">{category.description}</p>
        )}
        <div className="flex items-stretch gap-[8px]">
          <div className="flex-1 text-center py-[8px] rounded-[10px]" style={{ background: 'var(--paper2)' }}>
            <div className="sm-mono text-[17px] font-bold">{total}</div>
            <div className="text-[10.5px] text-sub mt-[2px]">{dict.categories.spots}</div>
          </div>
          <div className="flex-1 text-center py-[8px] rounded-[10px]" style={{ background: 'var(--paper2)' }}>
            <div className="sm-mono text-[17px] font-bold" style={{ color: 'var(--green-d)' }}>{checkedCount}</div>
            <div className="text-[10.5px] text-sub mt-[2px]">{dict.map.visited}</div>
          </div>
          <div className="flex-1 text-center py-[8px] rounded-[10px]" style={{ background: 'var(--paper2)' }}>
            <div className="sm-mono text-[17px] font-bold">{category.xp_per_checkin}</div>
            <div className="text-[10.5px] text-sub mt-[2px]">{dict.categories.xpPerSpot}</div>
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-[12px]">
          <div className="flex items-center justify-between mb-[5px]">
            <span className="text-[11.5px] text-sub">{dict.categories.collectionProgress}</span>
            <span className="sm-mono text-[12px] font-bold" style={{ color: isComplete ? 'var(--green-d)' : 'var(--sub)' }}>
              {isComplete ? dict.categories.complete : `${checkedCount}/${total}`}
            </span>
          </div>
          <div className="sm-pbar" style={{ height: 6 }}>
            <div className="sm-pfill" style={{ width: `${pct}%`, background: category.color }} />
          </div>
        </div>
      </div>

      {/* embedded map */}
      <div ref={mapWrapRef} className="sm-card overflow-hidden p-0">
        <div className="w-full" style={{ height: 280 }}>
          <MapView
            locations={locations}
            categories={[{ id: category.id, name: category.name, color: category.color, icon: category.icon }]}
            userCheckinLocationIds={locations.filter(l => l.checked).map(l => l.id)}
            friendCheckins={[]}
            isLoggedIn={isLoggedIn}
            lockedCategoryId={category.id}
            focusLocationId={focusLocationId}
            embedded
          />
        </div>
      </div>

      {/* location list */}
      <div className="sm-card">
        <div className="sm-card-title">{dict.categories.locationsList}</div>
        {total === 0 ? (
          <div className="py-[18px] text-center text-[13px] text-sub">{dict.categories.emptyLocations}</div>
        ) : (
          locations.map((loc, i) => (
            <button
              key={loc.id}
              onClick={() => handleLocationClick(loc.id)}
              className="flex items-center gap-[9px] w-full text-left py-[10px] cursor-pointer bg-transparent border-none"
              style={i === 0 ? undefined : { borderTop: '1px solid var(--line2)' }}
            >
              <span
                className="w-[22px] h-[22px] rounded-full grid place-items-center flex-shrink-0"
                style={{ background: loc.checked ? 'var(--green)' : 'var(--paper2)' }}
              >
                {loc.checked && <Check size={13} strokeWidth={3} className="text-white" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold truncate">{loc.name}</div>
                {loc.prefecture && <div className="text-[11px] text-sub">{loc.prefecture}</div>}
              </div>
            </button>
          ))
        )}
      </div>

      {/* friends */}
      {friends.length > 0 && (
        <div className="sm-card">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {friends.slice(0, 5).map(f => (
                <span
                  key={f.userId}
                  className="w-5 h-5 rounded-full bg-ink2 text-white text-[9px] font-bold grid place-items-center border border-paper"
                >
                  {f.username[0]?.toUpperCase()}
                </span>
              ))}
            </div>
            <span className="text-[11.5px] text-sub">{dict.categories.friendsWorking}</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 驗證 build 通過**

Run: `npm run build`
Expected: build 成功。此元件尚未被任何路由使用，build 仍應通過（未使用的 export 不報錯）。

> 註：若 `sm-card-title`、`sm-iconbtn`、`sm-pbar`、`sm-pfill`、`--paper2`、`--green-d`、`--green` 等 class/變數在 `globals.css` 不存在會在執行時樣式失效（不會讓 build 失敗）。這些皆為既有元件（`CategoriesPageClient`、`CategoryCard`）已使用的 token，沿用即可。

> 不要 commit。

---

## Task 5: 建立詳細頁 server route

**Files:**
- Create: `src/app/categories/[id]/page.tsx`

目標：依 `params.id` 在 server 端抓主題、該主題 active 地點、登入者打卡、好友打卡，並在地化，傳給 `CategoryDetailClient`。

- [ ] **Step 1: 建立 route 檔**

建立 `src/app/categories/[id]/page.tsx`，內容：

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoryDetailClient, type DetailLocation, type DetailFriend } from '@/components/categories/CategoryDetailClient'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const locale = await getLocale()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: category }, { data: locations }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single() as any,
    supabase.from('locations').select('*').eq('category_id', id).eq('is_active', true) as any,
  ])

  if (!category) notFound()

  const locationIds: string[] = (locations ?? []).map((l: any) => l.id)

  let checkedSet = new Set<string>()
  let friends: DetailFriend[] = []

  if (user && locationIds.length > 0) {
    const { data: myCheckins } = await supabase
      .from('checkins')
      .select('location_id')
      .eq('user_id', user.id)
      .eq('is_first', true)
      .in('location_id', locationIds) as any
    checkedSet = new Set<string>((myCheckins ?? []).map((c: any) => c.location_id))

    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted') as any

    const friendIds: string[] = (friendships ?? []).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    if (friendIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from('user_profiles')
        .select('id, username')
        .in('id', friendIds) as any

      const { data: fCheckins } = await supabase
        .from('checkins')
        .select('location_id, user_id')
        .eq('is_first', true)
        .in('user_id', friendIds)
        .in('location_id', locationIds) as any

      const countByFriend: Record<string, number> = {}
      ;(fCheckins ?? []).forEach((c: any) => {
        countByFriend[c.user_id] = (countByFriend[c.user_id] ?? 0) + 1
      })

      friends = Object.entries(countByFriend).map(([userId, checked]) => ({
        userId,
        username: (friendProfiles ?? []).find((p: any) => p.id === userId)?.username ?? '?',
        checked,
      }))
    }
  }

  const localizedCategory = {
    id: category.id,
    name: localizedName(category, locale),
    description: category.description,
    color: category.color,
    icon: category.icon,
    xp_per_checkin: category.xp_per_checkin,
  }

  const detailLocations: DetailLocation[] = (locations ?? []).map((loc: any) => ({
    id: loc.id,
    name: localizedName(loc, locale),
    prefecture: loc.prefecture,
    lat: loc.lat,
    lng: loc.lng,
    category_id: loc.category_id,
    categories: {
      id: category.id,
      name: localizedCategory.name,
      color: category.color,
      icon: category.icon,
      checkin_radius_meters: category.checkin_radius_meters,
      xp_per_checkin: category.xp_per_checkin,
    },
    checked: checkedSet.has(loc.id),
  }))

  return (
    <CategoryDetailClient
      category={localizedCategory}
      locations={detailLocations}
      checkedCount={detailLocations.filter(l => l.checked).length}
      friends={friends}
      isLoggedIn={!!user}
    />
  )
}
```

- [ ] **Step 2: 驗證 build 通過**

Run: `npm run build`
Expected: build 成功，`/categories/[id]` 出現在 route 清單。

- [ ] **Step 3: Runtime 驗證完整流程**

Run: `npm run dev`，從 `http://localhost:4000/categories` 點一個主題卡片。
Expected:
- 進入 `/categories/<id>`，顯示主題名稱/說明/統計/進度條。
- 內嵌地圖固定高度（280px），只顯示該主題的點且自動 fitBounds，無篩選列、無打卡 FAB、marker popup 只有名稱無打卡按鈕。
- 點地點清單某一項：地圖捲入視野並 fly 到該點、開啟其名稱 popup。
- 已打卡的點在清單顯示綠色打勾、地圖 marker 為彩色含打勾。
- 切換語系（ja/en/zh）所有文字在地化、無硬編碼。
- 登出狀態：已打卡為 0、好友區塊隱藏。
- 不存在的 id（例如 `/categories/不存在`）→ 404。

> 不要 commit。

---

## Self-Review（撰寫者已核對 spec）

- **Spec coverage：** 路由+列表卡片可點（Task 3、5）、server 資料流（Task 5）、MapView 內嵌鎖定唯讀+聚焦（Task 2）、五個區塊介紹/統計/進度條/地圖/清單/好友（Task 4）、i18n 三語（Task 1）、邊角情況 notFound/空地點/未登入（Task 4、5 已涵蓋）。固定高度地圖、唯讀（不打卡）皆已落在 Task 2/4。
- **Placeholder scan：** 無 TBD/TODO，每個改動皆附完整程式碼與確切路徑/行號。
- **Type consistency：** `DetailLocation`/`DetailFriend`/`DetailCategory` 於 Task 4 定義並於 Task 5 import 使用；`DetailLocation` 形狀符合 `MapView` 的 `Location` 介面（`id/name/lat/lng/category_id/categories{...}`）；`lockedCategoryId`/`focusLocationId`/`embedded` 在 Task 2 定義、Task 4 使用，名稱一致。

## 完成後

全部 Task 完成且 runtime 驗證通過後，與使用者確認再一次提交（使用者先前要求暫不 commit）。
