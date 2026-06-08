# 編輯個人資料功能設計

## 概述

在 `/profile` 頁面新增「編輯」按鈕，點擊後彈出 modal，讓使用者修改使用者名稱和頭像。

## 資料庫變更

`user_profiles` 新增欄位：

- `avatar_url` (text, nullable) — 頭像圖片的 R2 公開 URL

Migration：`ALTER TABLE user_profiles ADD COLUMN avatar_url text;`

TypeScript 型別 (`src/types/database.ts`) 同步更新。

## 頭像上傳

- 複用現有 `/api/upload` + `src/lib/r2/client.ts` 的 R2 上傳流程
- 上傳路徑：`avatars/{userId}.webp`
- 流程：前端選圖 → 前端壓縮 → POST `/api/upload` → 後端傳 R2 → 回傳 URL
- 需要調整 `/api/upload` 支援不同的上傳目的（checkin vs avatar），或新增獨立的 avatar upload endpoint

## UI 設計

### 入口

`/profile` 頁面新增「編輯個人資料」按鈕，點擊開啟 modal。

### Modal 排版（置中式）

```
┌─────────────────────────────┐
│  編輯個人資料            ✕  │
│                             │
│         ┌──────┐            │
│         │ 頭像 │            │
│         └──────┘            │
│        變更頭像              │
│                             │
│  使用者名稱                  │
│  ┌─────────────────────┐    │
│  │ Panda               │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │       儲存           │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### 頭像顯示邏輯

- 有 `avatar_url` → 顯示圖片（CSS `object-cover` + 圓形裁切）
- 沒有 `avatar_url` → 維持現有首字母頭像

### 使用者名稱限制

- 最大 20 字
- 無其他限制

## 影響範圍

需要更新頭像顯示的元件：

- `ProfileHeader` — 個人檔案頁面的頭像
- `ProfilePageClient` — 傳遞 avatar_url 資料
- `/profile/[userId]` — 公開個人檔案也要顯示頭像
- 排行榜、好友列表等有顯示使用者的地方

## i18n

三個語言檔 (`ja.json`, `en.json`, `zh.json`) 新增：

- `profile.edit` — 編輯個人資料
- `profile.changeAvatar` — 變更頭像
- `profile.username` — 使用者名稱
- `profile.save` — 儲存
- `profile.saving` — 儲存中
- `profile.saveSuccess` — 儲存成功

## 技術流程

1. 使用者點擊「編輯」→ 開啟 modal，帶入當前 username 和 avatar_url
2. 使用者點「變更頭像」→ 觸發 file input → 前端壓縮 → 上傳到 `/api/upload` → 取得 URL → modal 內即時預覽
3. 使用者修改名稱（前端檢查 ≤ 20 字）
4. 點「儲存」→ 呼叫 Supabase 更新 `user_profiles` 的 `username` 和 `avatar_url`
5. 成功後關閉 modal，重新整理頁面資料
