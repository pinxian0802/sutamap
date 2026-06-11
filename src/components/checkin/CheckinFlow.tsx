'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoCapture } from './PhotoCapture'
import { haversineDistance } from '@/lib/geo/distance'
import { useDictionary, useLocale, formatTemplate } from '@/lib/i18n/context'
import { Check } from 'lucide-react'
import { CheckinV1Stamp } from '@/components/animations/CheckinSuccessAnim'
import { CheckinLevelUpPause } from '@/components/animations/CheckinLevelUpFlow'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  themes: { name: string; color: string; checkin_radius_meters: number; xp_per_checkin: number }
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
  const locale = useLocale()
  const [step, setStep] = useState<Step>('photo')
  const [visitRecord, setVisitRecord] = useState<{ photoUrl: string | null; createdAt: string } | null>(null)
  const [recordLoading, setRecordLoading] = useState(false)
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

  useEffect(() => {
    if (!alreadyCheckedIn || !isLoggedIn) return
    setRecordLoading(true)
    fetch(`/api/checkin/record?locationId=${location.id}`)
      .then(r => r.json())
      .then(d => setVisitRecord(d.record))
      .catch(() => {})
      .finally(() => setRecordLoading(false))
  }, [alreadyCheckedIn, isLoggedIn, location.id])

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
    // if (dist > location.themes.checkin_radius_meters) {
    //   setError(formatTemplate(dict.checkin.tooFar, {
    //     dist: Math.round(dist),
    //     radius: location.themes.checkin_radius_meters,
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

  // Already visited — re-checkin is blocked; show the previous visit record
  if (alreadyCheckedIn && step !== 'success') {
    const localeTag = { ja: 'ja-JP', en: 'en-US', zh: 'zh-TW' }[locale]
    return (
      <div className="text-center space-y-4 py-1">
        {recordLoading ? (
          <p className="text-sub py-10">{dict.checkin.loadingRecord}</p>
        ) : (
          <>
            {visitRecord?.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={visitRecord.photoUrl}
                alt=""
                className="w-full max-h-[300px] object-cover rounded-[16px]"
              />
            )}
            <div className="flex items-center justify-center gap-[8px]">
              <span className="inline-grid place-items-center w-[26px] h-[26px] rounded-full bg-tint">
                <Check size={15} strokeWidth={2.8} className="text-green-d" />
              </span>
              <span className="text-[16px] font-bold">{dict.checkin.alreadyVisitedTitle}</span>
            </div>
            {visitRecord?.createdAt && (
              <p className="text-[12.5px] text-sub">
                {formatTemplate(dict.checkin.visitedOn, {
                  date: new Date(visitRecord.createdAt).toLocaleDateString(localeTag),
                })}
              </p>
            )}
          </>
        )}
        <div className="px-4 pb-4">
          <button
            className="sm-btn sm-btn-primary w-full"
            onClick={() => (onComplete ? onComplete() : router.push('/map'))}
          >
            {dict.checkin.done}
          </button>
        </div>
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
      {step === 'photo' && (
        <div className="flex gap-[10px]">
          {[
            { k: 'XP', v: `+${location.themes.xp_per_checkin}`, highlight: true },
            { k: dict.checkin.radiusLabel, v: `${location.themes.checkin_radius_meters}m` },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center bg-paper2 rounded-[13px] py-3 px-1">
              <div className="sm-mono text-[17px] font-bold" style={{ color: s.highlight ? 'var(--green-d)' : 'var(--ink)' }}>
                {s.v}
              </div>
              <div className="text-[10.5px] text-sub mt-[3px]">{s.k}</div>
            </div>
          ))}
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
