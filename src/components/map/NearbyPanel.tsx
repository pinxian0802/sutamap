'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Loader2, X } from 'lucide-react'
import { haversineDistance } from '@/lib/geo/distance'
import { useDictionary } from '@/lib/i18n/context'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  theme_id: string
  themes: { name: string; color: string; icon: string; checkin_radius_meters: number; xp_per_checkin: number }
}

interface Props {
  locations: Location[]
  checkedSet: Set<string>
  onSelect: (locationId: string) => void
  onClose: () => void
}

interface SpotWithDistance {
  location: Location
  distance: number
  inRange: boolean
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`
  return `${(m / 1000).toFixed(1)}km`
}

export function NearbyPanel({ locations, checkedSet, onSelect, onClose }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [spots, setSpots] = useState<SpotWithDistance[]>([])
  const [visible, setVisible] = useState(false)
  const dict = useDictionary()

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const withDist = locations.map(loc => {
          const distance = haversineDistance(latitude, longitude, loc.lat, loc.lng)
          return {
            location: loc,
            distance,
            inRange: distance <= loc.themes.checkin_radius_meters,
          }
        })
        withDist.sort((a, b) => a.distance - b.distance)
        setSpots(withDist.filter(s => s.distance <= 1000))
        setStatus('ready')
      },
      () => setStatus('error'),
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [locations])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className="fixed inset-0 z-[700]">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(36,52,74,.34)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[520px] max-w-[calc(100%-28px)] bg-paper rounded-t-[22px] transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '85vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[38px] h-1 rounded-[2px]" style={{ background: '#d8d0bf' }} />
        </div>

        <div className="flex items-center justify-between px-[18px] pt-1 pb-3">
          <h2 className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            <Navigation size={16} strokeWidth={2.4} className="inline mr-2 text-green-d" />
            {dict.map.nearbySpots}
          </h2>
          <button className="sm-iconbtn" onClick={handleClose}>
            <X size={18} className="text-sub" />
          </button>
        </div>

        <div className="overflow-y-auto px-[18px] pb-6" style={{ maxHeight: 'calc(85vh - 70px)' }}>
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 py-10 text-sub text-[14px]">
              <Loader2 size={18} className="animate-spin" />
              {dict.map.gettingLocation}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-10 text-sub text-[14px]">
              {dict.map.gpsUnavailable}
            </div>
          )}

          {status === 'ready' && spots.length === 0 && (
            <div className="text-center py-10">
              <MapPin size={32} strokeWidth={1.5} className="text-line mx-auto" />
              <div className="text-[14px] text-sub mt-3">{dict.map.noNearbySpots}</div>
            </div>
          )}

          {status === 'ready' && spots.map(({ location: loc, distance, inRange }) => {
            const checked = checkedSet.has(loc.id)
            return (
              <button
                key={loc.id}
                className="nb-item flex items-center gap-[12px] w-full text-left py-[13px] border-b border-line2 last:border-b-0 cursor-pointer bg-transparent border-x-0 border-t-0"
                style={{ opacity: inRange ? 1 : 0.55 }}
                onClick={() => { if (inRange) onSelect(loc.id) }}
              >
                <span
                  className="w-[40px] h-[40px] rounded-[11px] grid place-items-center text-white text-[18px] flex-shrink-0"
                  style={{ background: inRange ? loc.themes.color : '#aab2bf' }}
                >
                  {loc.themes.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[14.5px] font-bold truncate">{loc.name}</span>
                    {checked && <span className="text-green text-[12px]">✓</span>}
                  </div>
                  <div className="text-[11.5px] text-sub mt-[2px]">{loc.themes.name}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="sm-mono text-[13px] font-bold" style={{ color: inRange ? 'var(--green-d)' : 'var(--sub)' }}>
                    {formatDistance(distance)}
                  </div>
                  {!inRange && (
                    <div className="text-[10px] text-sub mt-[1px]">{dict.map.tooFarLabel}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <style>{`
          .nb-item { transition: background .12s; }
          .nb-item:hover { background: var(--paper2); }
        `}</style>
      </div>
    </div>
  )
}
