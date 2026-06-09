'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoCapture } from './PhotoCapture'
import { haversineDistance } from '@/lib/geo/distance'
import { useDictionary, formatTemplate } from '@/lib/i18n/context'
import { Check } from 'lucide-react'
import { CheckinV1Stamp } from '@/components/animations/CheckinSuccessAnim'
import { CheckinLevelUpPause } from '@/components/animations/CheckinLevelUpFlow'

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
  onComplete?: () => void
}

type Step = 'photo' | 'gps' | 'submitting' | 'success' | 'error'

export function CheckinFlow({ location, isLoggedIn, alreadyCheckedIn, onComplete }: Props) {
  const router = useRouter()
  const dict = useDictionary()
  const [step, setStep] = useState<Step>('photo')
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [photoGps, setPhotoGps] = useState<{ lat: number; lng: number } | null>(null)
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    xpAwarded: number
    newTitle: any
    leveledUp?: boolean
    prevLevel?: number
    newLevel?: number
    xpBefore?: number
    xpMax?: number
  } | null>(null)

  function handlePhotoReady(blob: Blob, gps: { lat: number; lng: number } | null) {
    setPhoto(blob)
    setPhotoGps(gps)
    setLocalPhotoUrl(URL.createObjectURL(blob))
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
        setError(dict.checkin.gpsError)
        setStep('error')
        return
      }
    }

    // DEV: 距離檢查暫時關閉（測試用）
    // const dist = haversineDistance(lat, lng, location.lat, location.lng)
    // if (dist > location.categories.checkin_radius_meters) {
    //   setError(formatTemplate(dict.checkin.tooFar, {
    //     dist: Math.round(dist),
    //     radius: location.categories.checkin_radius_meters,
    //   }))
    //   setStep('error')
    //   return
    // }

    const formData = new FormData()
    formData.append('file', photo, 'checkin.jpg')
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!uploadRes.ok) {
      setError(dict.checkin.uploadFailed)
      setStep('error')
      return
    }
    const { url: photoUrl } = await uploadRes.json()

    const checkinRes = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId: location.id, photoUrl, lat, lng }),
    })
    const data = await checkinRes.json()

    if (!checkinRes.ok) {
      setError(data.error ?? dict.checkin.failed)
      setStep('error')
      return
    }

    setResult(data)
    setStep('success')
    router.refresh()
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-sub">{dict.checkin.loginRequired}</p>
        <button className="sm-btn sm-btn-primary" onClick={() => router.push('/auth/login')}>
          {dict.auth.login}
        </button>
      </div>
    )
  }

  if (step === 'success' && result) {
    const xpBefore = result.xpBefore ?? 0
    const xpMax = result.xpMax ?? 100

    return (
      <div className="text-center space-y-4">
        {result.leveledUp ? (
          <CheckinLevelUpPause
            xp={result.xpAwarded}
            locationName={location.name}
            xpBefore={xpBefore}
            xpMax={xpMax}
            prevLevel={result.prevLevel ?? 1}
            level={result.newLevel ?? 2}
            photoUrl={localPhotoUrl ?? undefined}
          />
        ) : (
          <CheckinV1Stamp
            xp={result.xpAwarded}
            locationName={location.name}
            xpBefore={xpBefore}
            xpMax={xpMax}
            photoUrl={localPhotoUrl ?? undefined}
          />
        )}

        {result.newTitle && (
          <div className="bg-tint border border-green/30 rounded-[13px] p-4 mx-4">
            <p className="text-sm text-green-d font-bold">{dict.checkin.titleEarned}</p>
            <p className="text-lg font-bold">{result.newTitle.name}</p>
          </div>
        )}

        <div className="px-4 pb-4">
          <button className="sm-btn sm-btn-primary w-full" onClick={() => onComplete ? onComplete() : router.push('/map')}>
            {dict.checkin.done}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-terra">{error}</p>
        <button className="sm-btn sm-btn-ghost" onClick={() => setStep('photo')}>{dict.checkin.tryAgain}</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {alreadyCheckedIn && (
        <div className="flex items-center gap-[9px] p-[11px_13px] rounded-[12px] bg-tint">
          <Check size={16} strokeWidth={2.6} className="text-green-d" />
          <span className="flex-1 text-[12.5px] text-green-d font-semibold">
            {dict.checkin.alreadyVisited}
          </span>
        </div>
      )}
      <PhotoCapture onReady={handlePhotoReady} />
      <button
        className="sm-btn sm-btn-primary"
        disabled={!photo || step === 'submitting'}
        onClick={handleSubmit}
        style={!photo ? { opacity: 0.45 } : undefined}
      >
        {step === 'submitting' ? dict.checkin.checkingIn : dict.checkin.submit}
      </button>
    </div>
  )
}
