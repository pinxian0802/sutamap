# 打卡照片放大檢視 + 打卡日期顯示

日期：2026-06-11

## 背景

地圖上每個打卡點（marker）點擊後會開啟 Leaflet popup（`MapView.tsx` 的 `buildPopupHtml`，以 HTML 字串組成）。打卡過的點會在 popup 上方顯示使用者當時的打卡照片（來自 `userCheckinPhotos[locationId]`）。

目前缺少兩個功能：

1. 照片只能看縮圖，無法放大。
2. popup 上看不到「何時打卡的」。

`checkins` 表已有 `created_at`（打卡日時），但目前沒有傳到地圖。

## 前提

- 打卡時 `photo_url` 為必填，因此「打卡過的點一定有照片」。沒照片的點＝尚未打卡＝沒有打卡時間。
- 因此打卡日期只會疊在照片上，不需要無照片的 fallback 分支。
- Lightbox 只針對使用者自己的打卡照片；朋友的點沒有照片，不在範圍內。
- 支援三語系 ja / en / zh，所有使用者可見文字不可硬編碼。

## 功能 1：打卡日期 overlay

### 資料流

- `src/app/map/page.tsx`：checkins 查詢加上 `created_at`。新增 prop `userCheckinDates: Record<string, string>`（locationId → ISO 時間字串），流法與現有 `userCheckinPhotos` 一致。
- `MapView` 新增對應 prop，並傳入 `buildPopupHtml`。

### 顯示

- 在 `buildPopupHtml` 的 `photoSection` 內，於照片左下角加一個半透明 overlay chip：日曆 icon + 格式化日期，疊在現有底部漸層之上。
- 日期格式用 `Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' })`：
  - ja → 2026年3月15日
  - en → March 15, 2026
  - zh → 2026年3月15日
- locale 透過 `useLocale()` 取得，傳入 `buildPopupHtml`。
- 標籤以日曆 icon 代替文字，日期本身由 formatter 產生（非硬編碼字串），因此不需新增 dict key。

## 功能 2：照片全螢幕 lightbox

- popup 內的 `<img>` 加上點擊行為：點擊時發出 CustomEvent `open-photo`，detail 帶照片 URL（沿用現有 `open-checkin` 的模式）。圖片加 `cursor:pointer`。
- `MapView` 新增 state `lightboxUrl: string | null` 與 `open-photo` 監聽器（在既有 init useEffect 內，與 `open-checkin` 並列註冊／清除）。
- 收到事件後，渲染一個 React 全螢幕 overlay：
  - 暗轉背景（如 `rgba(0,0,0,.85)`），`z-[1000]`（高於 popup 與 FAB）。
  - 照片以 `object-contain` 置中放大，最大不超出視窗。
  - 點背景或右上角 × 關閉（設 `lightboxUrl` 為 null）。
- 不做輪播、不做手勢縮放（YAGNI）。
- 關閉鈕為純 icon；如需 aria-label 可加 dict key，非必要。

## 影響檔案

- `src/app/map/page.tsx`：查詢加 `created_at`、組 `userCheckinDates`、傳 prop。
- `src/components/map/MapView.tsx`：接 `userCheckinDates` prop、`buildPopupHtml` 加日期參數與 overlay、img 加點擊發事件、新增 lightbox state / 監聽器 / overlay JSX。

## 驗證

- `npm run build` 通過。
- `npm run dev`（port 4000，預設 locale ja）：
  - 打卡過的點 popup 照片左下顯示打卡日期，語系切換格式正確。
  - 點照片可全螢幕放大，背景／× 可關閉。
  - 未打卡的點無日期、無照片，維持原樣。
