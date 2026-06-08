'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoCapture } from './PhotoCapture'
import { haversineDistance } from '@/lib/geo/distance'
import { useDictionary, formatTemplate } from '@/lib/i18n/context'
import { Check, Zap } from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ xpAwarded: number; newTitle: any } | null>(null)

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
        setError(dict.checkin.gpsError)
        setStep('error')
        return
      }
    }

    const dist = haversineDistance(lat, lng, location.lat, location.lng)
    if (dist > location.categories.checkin_radius_meters) {
      setError(formatTemplate(dict.checkin.tooFar, {
        dist: Math.round(dist),
        radius: location.categories.checkin_radius_meters,
      }))
      setStep('error')
      return
    }

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
    return (
      <div className="text-center py-4 space-y-4">
        <div className="text-[46px]">{location.categories.name.charAt(0)}</div>
        <div className="text-[22px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {dict.checkin.success}
        </div>
        <div className="text-[13.5px] text-sub">{location.name} ・ {dict.checkin.firstCheckin}</div>

        {result.xpAwarded > 0 && (
          <div className="inline-flex items-center gap-2 mx-auto px-5 py-[10px] rounded-[14px] bg-tint text-green-d font-bold text-[18px]" style={{ fontFamily: 'var(--font-display)' }}>
            <Zap size={20} strokeWidth={2} />
            +{result.xpAwarded} XP
          </div>
        )}

        {result.newTitle && (
          <div className="bg-tint border border-green/30 rounded-[13px] p-4">
            <p className="text-sm text-green-d font-bold">{dict.checkin.titleEarned}</p>
            <p className="text-lg font-bold">{result.newTitle.name}</p>
          </div>
        )}

        <button className="sm-btn sm-btn-primary" onClick={() => onComplete ? onComplete() : router.push('/map')}>
          {dict.checkin.done}
        </button>
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
