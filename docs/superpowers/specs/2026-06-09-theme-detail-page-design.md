# 主題詳細頁設計

日期：2026-06-09

## 背景與目標

`/categories` 頁面（UI 名稱「主題一覽」）目前列出所有主題（`categories` 表），每個主題是一張 `CategoryCard`，但卡片無法點擊、沒有詳細頁。

目標：讓使用者在主題一覽點擊任一主題，開啟該主題的**詳細頁**。詳細頁介紹這個主題，並在內嵌地圖上標出該主題的所有地點。

> 命名說明：程式內資料表叫 `categories`，但 UI 對使用者一律稱「主題」（`dict.nav.categories === "主題"`、`dict.categories.title === "主題一覽"`）。本設計不新增資料表，沿用 `categories` / `locations` / `checkins`。

## 範圍

- 新增路由 `/categories/[id]`（主題詳細頁）。
- 讓 `/categories` 列表的 `CategoryCard` 可點擊進入詳細頁。
- 為 `MapView` 新增「鎖定主題、唯讀」模式，供詳細頁內嵌重用。
- 三語（ja/en/zh）字典同步新增詳細頁文字。

不在範圍：新增主題的 CRUD（admin 既有流程不動）、打卡流程改動（詳細頁地圖唯讀，打卡仍在主地圖）。

## 路由與導覽

- 新增 `src/app/categories/[id]/page.tsx`（server component）。
- `CategoryCard` 改為可點擊整張卡片導向 `/categories/[id]`。
  - 注意：卡片內現有好友頭像是 `<Link>`，不可巢狀 `<a>`。做法：外層卡片改用 `useRouter().push('/categories/' + id)` 的可點容器（非 `<a>`），好友頭像維持 `<Link>` 並在 `onClick` 呼叫 `e.stopPropagation()`，避免點頭像時連帶觸發卡片導航。

## 資料流（server component）

`/categories/[id]/page.tsx` 在 server 端依 `params.id` 抓取，比照現有 `/categories/page.tsx` 與 `/map/page.tsx` 的查詢方式：

1. 取得該主題 category（`select('*')` where `id = params.id`）；查無資料則 `notFound()`。
2. 取得該主題底下所有 `is_active` 的 locations（含 `lat, lng, name, name_en, name_zh, prefecture, category_id`）。
3. 取得登入者（`supabase.auth.getUser()`）。若已登入：
   - 抓登入者在這些 location 的 `is_first` check-in → 計算已打卡集合 / 數量。
   - 抓好友（`friendships` status=accepted）在這些 location 的 `is_first` check-in → 好友進度（沿用 `/categories` 的 `friendsPerCategory` 邏輯，但只針對此主題）。
4. 所有 name 經 `localizedName(row, locale)` 轉成當前語系。
5. 將整理好的資料傳給 client 元件 `CategoryDetailClient`。

未登入：已打卡數為 0、不顯示好友區塊。

## 元件結構

- `src/app/categories/[id]/page.tsx` — server，負責資料抓取與在地化。
- `src/components/categories/CategoryDetailClient.tsx` — client，負責版面與區塊；持有 `focusLocationId` state 串接清單與地圖。
- `src/components/map/MapView.tsx` — 新增 props，供詳細頁鎖定 + 唯讀重用（見下）。
- `src/components/categories/CategoryCard.tsx` — 改為可點擊導向詳細頁。

## 頁面區塊（由上到下，垂直滾動）

1. **主題介紹 + 統計**：色塊 + icon、主題標題、`description` 文字；統計列顯示總點數、已打卡數、XP/處。
2. **進度條**：已打卡 / 總點數的視覺化進度（沿用 `ui/progress` 與既有 `sm-card` 風格）。
3. **內嵌地圖**：固定高度區塊（約 280px），重用 `MapView` 的鎖定+唯讀模式。
4. **地點清單**：列出該主題所有地點（名稱、都道府縣、已打卡打勾）。點擊清單項 → 設定 `focusLocationId` → 地圖 fly 到對應點並開啟名稱 popup。
5. **好友進度**：沿用列表卡片「好友也在挑戰中」的呈現（`dict.categories.friendsWorking`）。未登入或無好友時隱藏。

## MapView 重用：鎖定 + 唯讀模式

為 `MapView` 新增 props（皆 optional，不影響主地圖既有行為）：

- `lockedCategoryId?: string`
  - 初始即將 `selectedCategoryId` 設為此值（沿用既有篩選 marker + fit bounds 邏輯，`MapView.tsx:160-188`）。
  - 隱藏 `CategoryFilter` 篩選列。
  - 唯讀：marker 點擊只顯示名稱 popup，不進打卡流程（隱藏/停用 check-in FAB 與打卡 modal 觸發）。
- `focusLocationId?: string | null`
  - 當值改變時，地圖 fly 到該 location 並開啟其 popup。供地點清單點擊用。

主地圖（`/map`）呼叫時不傳這些 props，行為完全不變。

## i18n

詳細頁新增文字一律走 `dict`，`ja/en/zh` 三檔同步新增。新增 key 放在 `categories` 區塊下，預計包含：

- `locationsList`（地點清單標題）
- `progress`（已打卡 X / Y，使用 `formatTemplate`）
- `emptyLocations`（此主題尚無地點的提示）

可重用既有 key：`categories.complete`、`categories.spots`、`categories.xpPerSpot`、`categories.friendsWorking`、`categories.collectionProgress`、`map.visited` 等，避免重複。

## 邊角情況

- 主題不存在：`notFound()`。
- 主題沒有任何 active location：地圖顯示空狀態，地點清單顯示 `emptyLocations` 提示。
- 未登入：統計的已打卡為 0，隱藏好友進度區塊。

## 測試

- 點擊主題一覽卡片可進入 `/categories/[id]`；點好友頭像不會誤觸卡片導航。
- 詳細頁地圖只顯示該主題的點並自動 fit bounds；篩選列隱藏；無法觸發打卡。
- 點地點清單項，地圖 fly 到對應點。
- 三語切換下，詳細頁所有文字皆在地化、無硬編碼字串。
- 未登入時統計為 0、好友區塊隱藏；無地點時顯示空狀態。
