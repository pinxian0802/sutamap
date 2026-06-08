# Profile 設定 Dropdown 設計

## 目標

將個人頁面右上角的「編輯」鉛筆按鈕，改為「設定」齒輪按鈕，點擊後展開 dropdown，dropdown 內放「編輯個人檔案」選項。

## 範圍

單一檔案修改：`src/components/profile/ProfilePageClient.tsx`

## 設計

### 狀態

- `showEdit: boolean` — 控制 EditProfileModal（既有）
- `showDropdown: boolean` — 控制 dropdown 顯示

### UI 結構

```
[Settings 齒輪按鈕]
  └─ dropdown (absolute, 右對齊按鈕)
       └─ [編輯個人檔案] → 關閉 dropdown + 開 EditProfileModal
```

### 點擊外側關閉

使用 `useRef` 取得 dropdown 容器，`useEffect` 監聽 `mousedown`，點擊容器外時設 `showDropdown = false`。

### i18n

使用現有 `dict.profile.edit`（「編輯個人資料」），不需新增鍵值。

## 不在範圍內

- Dropdown 其他選項（未來可擴充）
- 鍵盤導覽
