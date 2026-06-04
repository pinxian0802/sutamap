# Map + Check-in Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the interactive Leaflet map with CARTO tiles, category filtering, marker clustering, and the full check-in flow (GPS validation + photo upload to R2 + XP award + theme completion detection).

**Architecture:** Map runs as a Client Component (dynamic import to avoid SSR issues with Leaflet). Check-in logic lives in two API routes: `/api/upload` for R2 photo upload, `/api/checkin` for validation + XP + completion. XP and level calculation is a pure utility function shared between client and server.

**Tech Stack:** Leaflet.js, leaflet.markercluster, CARTO Basemap, exifr, browser-image-compression, @aws-sdk/client-s3 (R2), Supabase server client

**Prerequisite:** Plan 1 (Foundation) must be complete.

---

## File Structure

```
src/
├── app/
│   ├── map/
│   │   └── page.tsx                     # Server Component, fetches locations + user checkins
│   ├── checkin/
│   │   └── [id]/
│   │       └── page.tsx                 # Server Component, fetches location details
│   └── api/
│       ├── upload/
│       │   └── route.ts                 # R2 upload endpoint (POST)
│       └── checkin/
│           └── route.ts                 # Check-in logic: validate + XP + completion (POST)
├── components/
│   ├── map/
│   │   ├── MapView.tsx                  # Client Component: Leaflet map
│   │   ├── CategoryFilter.tsx           # Client Component: category toggle sidebar
│   │   └── FriendLayer.tsx              # Placeholder (implemented in Plan 4)
│   └── checkin/
│       ├── CheckinFlow.tsx              # Client Component: orchestrates check-in steps
│       └── PhotoCapture.tsx             # Client Component: photo select + EXIF extract + compress
└── lib/
    ├── geo/
    │   ├── distance.ts                  # Haversine distance calculation
    │   └── exif.ts                      # EXIF GPS extraction + strip
    ├── xp/
    │   └── calculator.ts                # XP → level formula
    └── r2/
        └── client.ts                    # S3-compatible R2 client (server-only)
```

---

## Task 1: Geo Utilities

**Files:**
- Create: `src/lib/geo/distance.ts`
- Create: `src/lib/geo/exif.ts`

- [ ] **Step 1: Write haversine distance** `src/lib/geo/distance.ts`

```typescript
const EARTH_RADIUS_M = 6371000

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

- [ ] **Step 2: Write EXIF utilities** `src/lib/geo/exif.ts`

```typescript
import exifr from 'exifr'

export interface GpsCoords {
  lat: number
  lng: number
}

export async function extractGpsFromPhoto(file: File): Promise<GpsCoords | null> {
  try {
    const result = await exifr.gps(file)
    if (!result?.latitude || !result?.longitude) return null
    return { lat: result.latitude, lng: result.longitude }
  } catch {
    return null
  }
}

export async function stripExifAndCompress(file: File): Promise<Blob> {
  const { default: imageCompression } = await import('browser-image-compression')
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
  return compressed
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/geo/
git commit -m "feat: geo utilities — haversine distance, EXIF GPS extraction"
```

---

## Task 2: XP Calculator

**Files:**
- Create: `src/lib/xp/calculator.ts`

- [ ] **Step 1: Write XP/level calculator** `src/lib/xp/calculator.ts`

```typescript
// Level formula: xp needed for level N = N*(N-1)*50
// Inverse: level = floor(0.5 + sqrt(0.25 + xp/50))
export function xpToLevel(xp: number): number {
  return Math.floor(0.5 + Math.sqrt(0.25 + xp / 50))
}

export function xpForLevel(level: number): number {
  return level * (level - 1) * 50
}

export function xpToNextLevel(xp: number): { current: number; needed: number; level: number } {
  const level = xpToLevel(xp)
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  return {
    current: xp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
    level,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/xp/
git commit -m "feat: XP level calculator"
```

---

## Task 3: R2 Client

**Files:**
- Create: `src/lib/r2/client.ts`

- [ ] **Step 1: Install AWS SDK for R2**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] **Step 2: Write R2 client** `src/lib/r2/client.ts`

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return `${process.env.R2_PUBLIC_URL}/${key}`
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/r2/
git commit -m "feat: Cloudflare R2 upload client"
```

---

## Task 4: Upload API Route

**Files:**
- Create: `src/app/api/upload/route.ts`

- [ ] **Step 1: Write upload route** `src/app/api/upload/route.ts`

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

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type === 'image/jpeg' ? 'jpg' : 'webp'
  const key = `checkins/${user.id}/${randomUUID()}.${ext}`

  const url = await uploadToR2(key, buffer, file.type)
  return NextResponse.json({ url })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/upload/
git commit -m "feat: photo upload API route to R2"
```

---

## Task 5: Check-in API Route

**Files:**
- Create: `src/app/api/checkin/route.ts`

- [ ] **Step 1: Write check-in route** `src/app/api/checkin/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { haversineDistance } from '@/lib/geo/distance'
import { xpToLevel } from '@/lib/xp/calculator'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { locationId, photoUrl, lat, lng } = await request.json()

  // Fetch location + category
  const { data: location } = await supabase
    .from('locations')
    .select('*, categories(*)')
    .eq('id', locationId)
    .single()

  if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  const distance = Math.round(haversineDistance(lat, lng, location.lat, location.lng))
  const radius = location.categories.checkin_radius_meters
  if (distance > radius) {
    return NextResponse.json(
      { error: 'Too far', distance, required: radius },
      { status: 422 }
    )
  }

  // Check if first check-in
  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('user_id', user.id)
    .eq('location_id', locationId)
    .eq('is_first', true)
    .maybeSingle()

  const isFirst = !existing

  // Insert check-in
  const { error: checkinError } = await supabase
    .from('checkins')
    .insert({ user_id: user.id, location_id: locationId, photo_url: photoUrl, checkin_lat: lat, checkin_lng: lng, distance_meters: distance, is_first: isFirst })

  if (checkinError) return NextResponse.json({ error: checkinError.message }, { status: 500 })

  let xpAwarded = 0
  let newBadge = null
  let newTitle = null

  if (isFirst) {
    const xpGain = location.categories.xp_per_checkin

    // Update user XP
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_xp')
      .eq('id', user.id)
      .single()

    const newXp = (profile?.total_xp ?? 0) + xpGain
    const newLevel = xpToLevel(newXp)

    await supabase
      .from('user_profiles')
      .update({ total_xp: newXp, level: newLevel })
      .eq('id', user.id)

    xpAwarded = xpGain

    // Check theme completion
    const { count: totalLocations } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', location.category_id)
      .eq('is_active', true)

    const { count: userCheckins } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_first', true)
      .in('location_id',
        (await supabase.from('locations').select('id').eq('category_id', location.category_id).eq('is_active', true)).data?.map(l => l.id) ?? []
      )

    if (totalLocations === userCheckins) {
      // Award badge
      const { data: badge } = await supabase
        .from('badges')
        .select('*')
        .eq('category_id', location.category_id)
        .maybeSingle()

      if (badge) {
        await supabase.from('user_badges').upsert({ user_id: user.id, badge_id: badge.id })
        newBadge = badge
      }

      // Award title
      const { data: title } = await supabase
        .from('titles')
        .select('*')
        .eq('category_id', location.category_id)
        .maybeSingle()

      if (title) {
        await supabase.from('user_titles').upsert({ user_id: user.id, title_id: title.id })
        newTitle = title
      }
    }
  }

  return NextResponse.json({ success: true, isFirst, xpAwarded, newBadge, newTitle, distance })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/checkin/
git commit -m "feat: check-in API — GPS validation, XP award, theme completion"
```

---

## Task 6: Map Page (Server Component)

**Files:**
- Create: `src/app/map/page.tsx`

- [ ] **Step 1: Write map page** `src/app/map/page.tsx`

```tsx
import { createClient } from '@/lib/supabase/server'
import { MapView } from '@/components/map/MapView'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: locations }, { data: categories }] = await Promise.all([
    supabase.from('locations').select('*, categories(id, name, color, icon)').eq('is_active', true),
    supabase.from('categories').select('*'),
  ])

  let userCheckinLocationIds: string[] = []
  if (user) {
    const { data: checkins } = await supabase
      .from('checkins')
      .select('location_id')
      .eq('user_id', user.id)
      .eq('is_first', true)
    userCheckinLocationIds = checkins?.map(c => c.location_id) ?? []
  }

  return (
    <MapView
      locations={locations ?? []}
      categories={categories ?? []}
      userCheckinLocationIds={userCheckinLocationIds}
      isLoggedIn={!!user}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/map/
git commit -m "feat: map page — server component fetching locations and user check-ins"
```

---

## Task 7: MapView Client Component

**Files:**
- Create: `src/components/map/MapView.tsx`
- Create: `src/components/map/CategoryFilter.tsx`

- [ ] **Step 1: Install leaflet.markercluster**

```bash
npm install leaflet.markercluster @types/leaflet.markercluster
```

- [ ] **Step 2: Write CategoryFilter** `src/components/map/CategoryFilter.tsx`

```tsx
'use client'

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Props {
  categories: Category[]
  activeIds: Set<string>
  onToggle: (id: string) => void
}

export function CategoryFilter({ categories, activeIds, onToggle }: Props) {
  return (
    <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur rounded-xl shadow-lg p-3 space-y-2 max-w-[200px]">
      <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase px-1">テーマ</p>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onToggle(cat.id)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors ${
            activeIds.has(cat.id) ? 'bg-gray-100 font-medium' : 'text-gray-400'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: activeIds.has(cat.id) ? cat.color : '#d1d5db' }}
          />
          <span className="truncate">{cat.name}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write MapView** `src/components/map/MapView.tsx`

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryFilter } from './CategoryFilter'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  category_id: string
  categories: { id: string; name: string; color: string; icon: string }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Props {
  locations: Location[]
  categories: Category[]
  userCheckinLocationIds: string[]
  isLoggedIn: boolean
}

export function MapView({ locations, categories, userCheckinLocationIds, isLoggedIn }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const router = useRouter()
  const checkedSet = new Set(userCheckinLocationIds)
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.id))
  )

  function toggleCategory(id: string) {
    setActiveCategories(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      await import('leaflet.markercluster/dist/MarkerCluster.css')
      await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
      const { MarkerClusterGroup } = await import('leaflet.markercluster')

      const map = L.map(mapRef.current!, {
        center: [37.5, 136.5],
        zoom: 5,
        zoomControl: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, attribution: '© CartoDB · OpenStreetMap' }
      ).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapInstanceRef.current = map

      const clusterGroup = new MarkerClusterGroup()

      locations.forEach(loc => {
        const isChecked = checkedSet.has(loc.id)
        const color = loc.categories.color

        const icon = L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
            <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z"
                  fill="${isChecked ? color : '#9ca3af'}" />
            <circle cx="14" cy="14" r="5.5" fill="white" />
          </svg>`,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -38],
          className: '',
        })

        const marker = L.marker([loc.lat, loc.lng], { icon })
        marker.bindPopup(`
          <div style="padding:12px 16px;min-width:160px">
            <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:4px">${loc.categories.name}</div>
            <div style="font-size:15px;font-weight:600;color:#1a1814;margin-bottom:8px">${loc.name}</div>
            <button
              onclick="window.location.href='/checkin/${loc.id}'"
              style="width:100%;padding:6px;background:${color};color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer"
            >${isChecked ? '再訪する' : '打卡する'}</button>
          </div>
        `, { closeButton: false })

        clusterGroup.addLayer(marker)
      })

      map.addLayer(clusterGroup)
    }

    initMap()
  }, [])

  // Filter markers by active categories
  useEffect(() => {
    // Re-render by remounting (simple approach for now)
  }, [activeCategories])

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
      <CategoryFilter
        categories={categories}
        activeIds={activeCategories}
        onToggle={toggleCategory}
      />
      {!isLoggedIn && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow text-sm text-gray-600">
          打卡するには{' '}
          <a href="/auth/login" className="text-blue-600 font-medium underline">ログイン</a>
          {' '}が必要です
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/map/
git commit -m "feat: Leaflet map with CARTO tiles, clustering, category filter"
```

---

## Task 8: Check-in Page + Flow

**Files:**
- Create: `src/app/checkin/[id]/page.tsx`
- Create: `src/components/checkin/CheckinFlow.tsx`
- Create: `src/components/checkin/PhotoCapture.tsx`

- [ ] **Step 1: Write PhotoCapture** `src/components/checkin/PhotoCapture.tsx`

```tsx
'use client'

import { useState } from 'react'
import { extractGpsFromPhoto, stripExifAndCompress } from '@/lib/geo/exif'
import { Button } from '@/components/ui/button'

interface Props {
  onReady: (file: Blob, gps: { lat: number; lng: number } | null) => void
}

export function PhotoCapture({ onReady }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const gps = await extractGpsFromPhoto(file)
      const stripped = await stripExifAndCompress(file)
      const url = URL.createObjectURL(stripped)
      setPreview(url)
      onReady(stripped, gps)
    } catch {
      setError('写真の処理に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <img src={preview} alt="preview" className="w-full rounded-xl object-cover max-h-64" />
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
          <span className="text-2xl">📷</span>
          <span className="text-sm text-gray-500 mt-2">写真を選択</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      )}
      {loading && <p className="text-sm text-gray-500 text-center">処理中...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {preview && (
        <label className="block text-sm text-blue-600 text-center cursor-pointer underline">
          写真を変更
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </label>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write CheckinFlow** `src/components/checkin/CheckinFlow.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoCapture } from './PhotoCapture'
import { haversineDistance } from '@/lib/geo/distance'
import { Button } from '@/components/ui/button'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  categories: { name: string; color: string; checkin_radius_meters: number; xp_per_checkin: number }
}

interface Props {
  location: Location
  isLoggedIn: boolean
  alreadyCheckedIn: boolean
}

type Step = 'photo' | 'gps' | 'submitting' | 'success' | 'error'

export function CheckinFlow({ location, isLoggedIn, alreadyCheckedIn }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('photo')
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [photoGps, setPhotoGps] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ xpAwarded: number; newBadge: any; newTitle: any } | null>(null)

  function handlePhotoReady(blob: Blob, gps: { lat: number; lng: number } | null) {
    setPhoto(blob)
    setPhotoGps(gps)
  }

  async function handleSubmit() {
    if (!photo) return
    setStep('submitting')
    setError(null)

    let lat: number
    let lng: number

    if (photoGps) {
      lat = photoGps.lat
      lng = photoGps.lng
    } else {
      // Fall back to live GPS
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
        )
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch {
        setError('位置情報の取得に失敗しました。写真にGPS情報がある写真を使ってください。')
        setStep('error')
        return
      }
    }

    // Pre-check distance client-side
    const dist = haversineDistance(lat, lng, location.lat, location.lng)
    if (dist > location.categories.checkin_radius_meters) {
      setError(`距離が遠すぎます（${Math.round(dist)}m / 許容${location.categories.checkin_radius_meters}m）`)
      setStep('error')
      return
    }

    // Upload photo
    const formData = new FormData()
    formData.append('file', photo, 'checkin.jpg')
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!uploadRes.ok) {
      setError('写真のアップロードに失敗しました')
      setStep('error')
      return
    }
    const { url: photoUrl } = await uploadRes.json()

    // Submit check-in
    const checkinRes = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId: location.id, photoUrl, lat, lng }),
    })
    const data = await checkinRes.json()

    if (!checkinRes.ok) {
      setError(data.error ?? 'チェックイン失敗')
      setStep('error')
      return
    }

    setResult(data)
    setStep('success')
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-gray-500">打卡するにはログインが必要です</p>
        <Button onClick={() => router.push('/auth/login')}>ログイン</Button>
      </div>
    )
  }

  if (step === 'success' && result) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-bold">チェックイン完了！</h2>
        {result.xpAwarded > 0 && (
          <p className="text-blue-600 font-semibold">+{result.xpAwarded} XP 獲得！</p>
        )}
        {result.newTitle && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-600 font-semibold">🎉 称号獲得！</p>
            <p className="text-lg font-bold text-yellow-800">{result.newTitle.name}</p>
          </div>
        )}
        {result.newBadge && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-semibold">🏅 バッジ獲得！</p>
            <p className="text-lg font-bold text-blue-800">{result.newBadge.name}</p>
          </div>
        )}
        <Button onClick={() => router.push('/map')}>地図に戻る</Button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-4xl">❌</div>
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => setStep('photo')}>もう一度試す</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {alreadyCheckedIn && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          ✅ 訪問済み（再訪記録として保存されます・XPは加算されません）
        </div>
      )}
      <PhotoCapture onReady={handlePhotoReady} />
      <Button
        className="w-full"
        disabled={!photo || step === 'submitting'}
        onClick={handleSubmit}
        style={{ background: location.categories.color }}
      >
        {step === 'submitting' ? 'チェックイン中...' : 'チェックイン'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Write check-in page** `src/app/checkin/[id]/page.tsx`

```tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckinFlow } from '@/components/checkin/CheckinFlow'

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: location } = await supabase
    .from('locations')
    .select('*, categories(*)')
    .eq('id', id)
    .single()

  if (!location) notFound()

  let alreadyCheckedIn = false
  if (user) {
    const { data } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('location_id', id)
      .eq('is_first', true)
      .maybeSingle()
    alreadyCheckedIn = !!data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: location.categories.color }}>
            {location.categories.name}
          </p>
          <h1 className="text-2xl font-bold">{location.name}</h1>
          {location.prefecture && <p className="text-sm text-gray-500">{location.prefecture}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <CheckinFlow
            location={location}
            isLoggedIn={!!user}
            alreadyCheckedIn={alreadyCheckedIn}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/checkin/ src/components/checkin/
git commit -m "feat: check-in page with photo upload, GPS validation, XP award"
```

---

## Task 9: Verify

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify map loads**

Open http://localhost:3000/map — map should render with 4 markers for 四極点.

- [ ] **Step 3: Verify check-in page renders**

Click a marker → popup shows → click 打卡する → `/checkin/[id]` loads correctly.

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: map + check-in core complete"
```
