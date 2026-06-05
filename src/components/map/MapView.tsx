'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { CheckinModal } from './CheckinModal'
import { NearbyPanel } from './NearbyPanel'
import { useDictionary } from '@/lib/i18n/context'
import { Users, Camera } from 'lucide-react'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  category_id: string
  categories: { id: string; name: string; color: string; icon: string; checkin_radius_meters: number; xp_per_checkin: number }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface FriendCheckin {
  locationId: string
  userId: string
  username: string
  color: string
}

interface Props {
  locations: Location[]
  categories: Category[]
  userCheckinLocationIds: string[]
  friendCheckins: FriendCheckin[]
  isLoggedIn: boolean
}

export function MapView({ locations, categories, userCheckinLocationIds, friendCheckins, isLoggedIn }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const clusterRef = useRef<any>(null)
  const markersRef = useRef<Map<string, { marker: any; categoryId: string }>>(new Map())
  const friendLayerRef = useRef<any[]>([])
  const checkedSet = new Set(userCheckinLocationIds)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [friendModeOn, setFriendModeOn] = useState(false)
  const [checkinLocationId, setCheckinLocationId] = useState<string | null>(null)
  const [nearbyOpen, setNearbyOpen] = useState(false)
  const dict = useDictionary()

  const selectCategory = useCallback((id: string | null) => {
    setSelectedCategoryId(id)
  }, [])


  // Init map + create all markers
  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      await import('leaflet.markercluster/dist/MarkerCluster.css')
      await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
      await import('leaflet.markercluster')
      const MarkerClusterGroup = (L as any).MarkerClusterGroup

      if (cancelled) return

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
      leafletRef.current = L

      const clusterGroup = new MarkerClusterGroup()
      clusterRef.current = clusterGroup

      locations.forEach(loc => {
        const isChecked = checkedSet.has(loc.id)
        const color = loc.categories.color

        const icon = L.divIcon({
          html: `<div style="position:relative">
            <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;background:${isChecked ? color : '#aab2bf'};display:grid;place-items:center;box-shadow:0 4px 8px -2px rgba(45,74,107,.5)">
              <span style="transform:rotate(45deg);font-size:13px">${loc.categories.icon}</span>
            </div>
            ${isChecked ? `<span style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:var(--green,#7aa83c);border:2px solid #fff;display:grid;place-items:center;z-index:2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
            </span>` : ''}
            <span style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:3px;font-size:10px;font-weight:700;white-space:nowrap;color:var(--ink,#2d4a6b);background:rgba(251,248,241,.88);padding:2px 6px;border-radius:6px;border:1px solid var(--line,#e0d9c8);pointer-events:none">${loc.name}</span>
          </div>`,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -42],
          className: '',
        })

        const buttonLabel = isChecked ? dict.map.revisit : dict.map.checkin
        const marker = L.marker([loc.lat, loc.lng], { icon })
        marker.bindPopup(`
          <div style="padding:12px 16px;min-width:160px;font-family:var(--font-sans,'Zen Kaku Gothic New',sans-serif)">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};margin-bottom:4px">${loc.categories.name}</div>
            <div style="font-size:15px;font-weight:700;color:#2d4a6b;margin-bottom:8px">${loc.name}</div>
            <button
              onclick="document.dispatchEvent(new CustomEvent('open-checkin',{detail:{id:'${loc.id}'}}))"
              style="width:100%;padding:8px;background:#7aa83c;color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 10px -4px rgba(122,168,60,.7)"
            >${buttonLabel}</button>
          </div>
        `, { closeButton: false })

        markersRef.current.set(loc.id, { marker, categoryId: loc.category_id })
        clusterGroup.addLayer(marker)
      })

      map.addLayer(clusterGroup)
    }

    initMap()

    const handleOpenCheckin = (e: Event) => {
      const id = (e as CustomEvent).detail?.id
      if (id) {
        mapInstanceRef.current?.closePopup()
        setCheckinLocationId(id)
      }
    }
    document.addEventListener('open-checkin', handleOpenCheckin)

    return () => {
      cancelled = true
      document.removeEventListener('open-checkin', handleOpenCheckin)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Filter markers + fly to bounds when selectedCategoryId changes
  useEffect(() => {
    const cluster = clusterRef.current
    const map = mapInstanceRef.current
    if (!cluster) return

    cluster.clearLayers()
    const bounds: [number, number][] = []
    markersRef.current.forEach(({ marker, categoryId }) => {
      if (selectedCategoryId === null || categoryId === selectedCategoryId) {
        cluster.addLayer(marker)
        if (selectedCategoryId !== null) {
          const ll = marker.getLatLng()
          bounds.push([ll.lat, ll.lng])
        }
      }
    })

    if (map && leafletRef.current && bounds.length > 0) {
      map.fitBounds(leafletRef.current.latLngBounds(bounds), { padding: [60, 60], maxZoom: 12, duration: 0.8 })
    }
  }, [selectedCategoryId])

  // Friend overlay
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const doToggle = async () => {
      const L = (await import('leaflet')).default

      friendLayerRef.current.forEach(m => map.removeLayer(m))
      friendLayerRef.current = []

      if (!friendModeOn || friendCheckins.length === 0) return

      const friendCheckinMap: Record<string, { color: string; names: string[] }> = {}
      friendCheckins.forEach(fc => {
        if (!friendCheckinMap[fc.locationId]) {
          friendCheckinMap[fc.locationId] = { color: fc.color, names: [] }
        }
        friendCheckinMap[fc.locationId].names.push(fc.username)
      })

      Object.entries(friendCheckinMap).forEach(([locId, info]) => {
        const loc = locations.find(l => l.id === locId)
        if (!loc) return
        if (selectedCategoryId !== null && loc.category_id !== selectedCategoryId) return
        const friendIcon = L.divIcon({
          html: `<div style="width:13px;height:13px;border-radius:50%;background:${info.color};border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3)"></div>`,
          iconSize: [13, 13],
          iconAnchor: [7, 7],
          className: '',
        })
        const marker = L.marker([loc.lat, loc.lng], { icon: friendIcon })
          .bindPopup(
            `<div style="padding:8px 12px;font-family:var(--font-sans)"><strong>${loc.name}</strong><br/><span style="font-size:11px;color:#7d8ba0">${info.names.join(', ')} ${dict.map.visited}</span></div>`,
            { closeButton: false }
          )
          .addTo(map)
        friendLayerRef.current.push(marker)
      })
    }

    doToggle()
  }, [friendModeOn, friendCheckins, locations, selectedCategoryId])

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />

      {/* category selector with search */}
      <CategoryFilter
        categories={categories}
        locations={locations}
        selectedId={selectedCategoryId}
        onSelect={selectCategory}
      />

      {/* checkin FAB */}
      {isLoggedIn && (
        <button
          className="absolute left-1/2 -translate-x-1/2 bottom-[72px] z-[500] flex items-center gap-[9px] py-[14px] px-[22px] pl-[18px] rounded-[18px] bg-green text-white font-bold text-[15px] border-none cursor-pointer"
          style={{
            fontFamily: 'var(--font-display)',
            boxShadow: '0 14px 26px -10px rgba(122,168,60,.85)',
          }}
          onClick={() => setNearbyOpen(true)}
        >
          <Camera size={21} strokeWidth={2} /> {dict.map.checkinFab}
        </button>
      )}

      {!isLoggedIn && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-paper/90 backdrop-blur px-4 py-2 rounded-full text-sm text-sub"
          style={{ boxShadow: '0 6px 16px -8px rgba(45,74,107,.5)', border: '1px solid var(--line)' }}
        >
          {dict.map.loginRequired}{' '}
          <a href="/auth/login" className="text-green-d font-bold underline">{dict.map.loginLink}</a>
          {dict.map.loginSuffix ? ` ${dict.map.loginSuffix}` : ''}
        </div>
      )}

      {/* nearby panel */}
      {nearbyOpen && (
        <NearbyPanel
          locations={locations}
          checkedSet={checkedSet}
          onSelect={(id) => { setNearbyOpen(false); setCheckinLocationId(id) }}
          onClose={() => setNearbyOpen(false)}
        />
      )}

      {/* checkin modal */}
      {checkinLocationId && (() => {
        const loc = locations.find(l => l.id === checkinLocationId)
        if (!loc) return null
        return (
          <CheckinModal
            location={{
              id: loc.id,
              name: loc.name,
              lat: loc.lat,
              lng: loc.lng,
              categories: {
                name: loc.categories.name,
                color: loc.categories.color,
                checkin_radius_meters: loc.categories.checkin_radius_meters,
                xp_per_checkin: loc.categories.xp_per_checkin,
              },
            }}
            isLoggedIn={isLoggedIn}
            alreadyCheckedIn={checkedSet.has(checkinLocationId)}
            onClose={() => setCheckinLocationId(null)}
          />
        )
      })()}
    </div>
  )
}
