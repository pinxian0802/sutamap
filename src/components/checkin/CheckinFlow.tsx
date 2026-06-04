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
