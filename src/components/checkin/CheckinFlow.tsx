'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoCapture } from './PhotoCapture'
import { haversineDistance } from '@/lib/geo/distance'
import { Button } from '@/components/ui/button'
import { useDictionary, formatTemplate } from '@/lib/i18n/context'

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
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-gray-500">{dict.checkin.loginRequired}</p>
        <Button onClick={() => router.push('/auth/login')}>{dict.auth.login}</Button>
      </div>
    )
  }

  if (step === 'success' && result) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-bold">{dict.checkin.complete}</h2>
        {result.xpAwarded > 0 && (
          <p className="text-blue-600 font-semibold">{formatTemplate(dict.checkin.xpEarned, { xp: result.xpAwarded })}</p>
        )}
        {result.newTitle && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-600 font-semibold">{dict.checkin.titleEarned}</p>
            <p className="text-lg font-bold text-yellow-800">{result.newTitle.name}</p>
          </div>
        )}
        {result.newBadge && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-semibold">{dict.checkin.badgeEarned}</p>
            <p className="text-lg font-bold text-blue-800">{result.newBadge.name}</p>
          </div>
        )}
        <Button onClick={() => onComplete ? onComplete() : router.push('/map')}>{dict.checkin.backToMap}</Button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-4xl">❌</div>
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => setStep('photo')}>{dict.checkin.tryAgain}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {alreadyCheckedIn && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          {dict.checkin.alreadyVisited}
        </div>
      )}
      <PhotoCapture onReady={handlePhotoReady} />
      <Button
        className="w-full"
        disabled={!photo || step === 'submitting'}
        onClick={handleSubmit}
        style={{ background: location.categories.color }}
      >
        {step === 'submitting' ? dict.checkin.checkingIn : dict.checkin.submit}
      </Button>
    </div>
  )
}
