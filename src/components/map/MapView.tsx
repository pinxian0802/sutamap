'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ThemeFilter } from './ThemeFilter'
import { CheckinModal } from './CheckinModal'
import { NearbyPanel } from './NearbyPanel'
import { useDictionary } from '@/lib/i18n/context'
import { Users, Camera } from 'lucide-react'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  theme_id: string
  themes: { name: string; color: string; icon: string; checkin_radius_meters: number; xp_per_checkin: number }
}

interface Theme {
  uuid: string
  theme_id: string
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
  themes: Theme[]
  userCheckinLocationIds: string[]
  userCheckinPhotos?: Record<string, string>
  friendCheckins: FriendCheckin[]
  isLoggedIn: boolean
  lockedThemeId?: string
  focusLocationId?: string | null
  embedded?: boolean
}

export function MapView({ locations, themes, userCheckinLocationIds, userCheckinPhotos, friendCheckins, isLoggedIn, lockedThemeId, focusLocationId, embedded = false }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const clusterRef = useRef<any>(null)
  const plainGroupRef = useRef<any>(null)
  const markersRef = useRef<Map<string, { marker: any; themeId: string }>>(new Map())
  const friendLayerRef = useRef<any[]>([])
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const checkedSet = new Set(userCheckinLocationIds)
  const locked = lockedThemeId != null
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(lockedThemeId ?? null)
  const [friendModeOn, setFriendModeOn] = useState(false)
  const [checkinLocationId, setCheckinLocationId] = useState<string | null>(null)
  const [nearbyOpen, setNearbyOpen] = useState(false)
  const dict = useDictionary()

  const selectTheme = useCallback((id: string | null) => {
    setSelectedThemeId(id)
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

      // Keep Leaflet in sync with the container size (fixes gray tiles when the
      // container is sized/resized after init, e.g. responsive or sticky layouts).
      const ro = new ResizeObserver(() => map.invalidateSize())
      ro.observe(mapRef.current!)
      resizeObserverRef.current = ro

      const clusterGroup = new MarkerClusterGroup({ showCoverageOnHover: false })
      clusterRef.current = clusterGroup

      const plainGroup = L.layerGroup()
      plainGroupRef.current = plainGroup

      const lockedBounds: [number, number][] = []

      locations.forEach(loc => {
        if (locked && loc.theme_id !== lockedThemeId) return

        const isChecked = checkedSet.has(loc.id)
        const color = loc.themes.color

        const icon = L.divIcon({
          html: `<div style="position:relative">
            <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;background:${isChecked ? color : '#aab2bf'};display:grid;place-items:center;box-shadow:0 4px 8px -2px rgba(45,74,107,.5)">
              <span style="transform:rotate(45deg);font-size:13px">${loc.themes.icon}</span>
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

        const marker = L.marker([loc.lat, loc.lng], { icon })

        const photoUrl = userCheckinPhotos?.[loc.id]?.replace(/"/g, '%22')

        const checkBadge = `<div style="position:absolute;bottom:8px;right:8px;width:22px;height:22px;border-radius:50%;background:#7aa83c;border:2px solid rgba(255,255,255,.92);display:grid;place-items:center;box-sizing:border-box"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg></div>`

        const photoSection = photoUrl
          ? `<div style="position:relative"><img src="${photoUrl}" style="width:100%;height:126px;object-fit:cover;display:block" /><div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 55%,rgba(20,35,55,.38));pointer-events:none"></div>${checkBadge}</div>`
          : ''

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`
        const navIcon = `<a href="${mapsUrl}" target="_blank" rel="noopener" style="position:absolute;top:10px;right:11px;color:#9aa6b6;text-decoration:none;display:grid;place-items:center;opacity:.8"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></a>`
        const checkinBtn = `<button onclick="document.dispatchEvent(new CustomEvent('open-checkin',{detail:{id:'${loc.id}'}}))" style="width:100%;padding:9px 12px;background:#7aa83c;color:#fff;border:none;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;box-shadow:0 6px 14px -6px rgba(122,168,60,.65);box-sizing:border-box"><span>${isChecked ? dict.map.revisit : dict.map.checkin}</span><span style="font-size:10px;background:rgba(255,255,255,.22);padding:2px 7px;border-radius:5px">+${loc.themes.xp_per_checkin} XP</span></button>`

        const bodyHtml = photoUrl
          ? `<div style="position:relative;padding:12px 15px 14px">${navIcon}<div style="font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color};margin-bottom:3px">${loc.themes.name}</div><div style="font-size:14.5px;font-weight:700;color:#2d4a6b;line-height:1.25;margin-bottom:${locked ? '0' : '10px'};padding-right:20px">${loc.name}</div>${locked ? '' : checkinBtn}</div>`
          : `<div style="position:relative;padding:14px 15px 13px">${navIcon}<div style="display:flex;align-items:stretch;gap:10px;margin-bottom:${locked ? '0' : '11px'}"><div style="width:3px;border-radius:2px;background:${color};flex-shrink:0"></div><div style="min-width:0;padding-right:18px"><div style="font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color};margin-bottom:3px">${loc.themes.name}</div><div style="font-size:14.5px;font-weight:700;color:#2d4a6b;line-height:1.25">${loc.name}</div></div></div>${locked ? '' : checkinBtn}</div>`

        const popupHtml = `<div style="width:196px;background:#fbf8f1;font-family:var(--font-sans,'Zen Kaku Gothic New',sans-serif)">${photoSection}${bodyHtml}</div>`

        marker.bindPopup(popupHtml, { closeButton: false, className: 'sm-popup' })

        markersRef.current.set(loc.id, { marker, themeId: loc.theme_id })

        if (locked) {
          plainGroup.addLayer(marker)
          lockedBounds.push([loc.lat, loc.lng])
        } else {
          clusterGroup.addLayer(marker)
        }
      })

      map.addLayer(clusterGroup)
      map.addLayer(plainGroup)

      if (locked && lockedBounds.length > 0) {
        map.fitBounds(L.latLngBounds(lockedBounds), { padding: [50, 50], maxZoom: 14, duration: 0 })
      }
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
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Filter markers + fly to bounds when selectedThemeId changes
  useEffect(() => {
    const cluster = clusterRef.current
    const plain = plainGroupRef.current
    const map = mapInstanceRef.current
    if (!cluster || !plain) return

    // All themes → cluster. Single theme → no clustering.
    const useCluster = selectedThemeId === null

    cluster.clearLayers()
    plain.clearLayers()
    const bounds: [number, number][] = []
    markersRef.current.forEach(({ marker, themeId }) => {
      if (selectedThemeId === null || themeId === selectedThemeId) {
        if (useCluster) {
          cluster.addLayer(marker)
        } else {
          plain.addLayer(marker)
          const ll = marker.getLatLng()
          bounds.push([ll.lat, ll.lng])
        }
      }
    })

    if (map && leafletRef.current && bounds.length > 0) {
      map.fitBounds(leafletRef.current.latLngBounds(bounds), { padding: [60, 60], maxZoom: 12, duration: 0.8 })
    }
  }, [selectedThemeId])

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
        if (selectedThemeId !== null && loc.theme_id !== selectedThemeId) return
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
  }, [friendModeOn, friendCheckins, locations, selectedThemeId])

  // Fly to a specific location (used by the detail page location list)
  useEffect(() => {
    if (!focusLocationId) return
    const map = mapInstanceRef.current
    const entry = markersRef.current.get(focusLocationId)
    if (!map || !entry) return
    const ll = entry.marker.getLatLng()
    map.flyTo(ll, Math.max(map.getZoom(), 14), { duration: 0.8 })
    entry.marker.openPopup()
  }, [focusLocationId])

  return (
    <div className={embedded ? 'relative w-full h-full' : 'relative w-full h-screen -mb-[56px]'}>
      <div ref={mapRef} className="w-full h-full" />

      {/* theme selector with search */}
      {!locked && (
        <ThemeFilter
          themes={themes}
          locations={locations}
          selectedId={selectedThemeId}
          onSelect={selectTheme}
        />
      )}

      {/* checkin FAB */}
      {!locked && isLoggedIn && (
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

      {!locked && !isLoggedIn && (
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
      {!locked && nearbyOpen && (
        <NearbyPanel
          locations={locations}
          checkedSet={checkedSet}
          onSelect={(id) => { setNearbyOpen(false); setCheckinLocationId(id) }}
          onClose={() => setNearbyOpen(false)}
        />
      )}

      {/* checkin modal */}
      {!locked && checkinLocationId && (() => {
        const loc = locations.find(l => l.id === checkinLocationId)
        if (!loc) return null
        return (
          <CheckinModal
            location={{
              id: loc.id,
              name: loc.name,
              lat: loc.lat,
              lng: loc.lng,
              themes: {
                name: loc.themes.name,
                color: loc.themes.color,
                checkin_radius_meters: loc.themes.checkin_radius_meters,
                xp_per_checkin: loc.themes.xp_per_checkin,
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
