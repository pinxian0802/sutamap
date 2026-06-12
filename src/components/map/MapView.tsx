'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ThemeFilter } from './ThemeFilter'
import { CheckinModal } from './CheckinModal'
import { NearbyPanel } from './NearbyPanel'
import { useDictionary, useLocale } from '@/lib/i18n/context'
import { Users, Camera, X } from 'lucide-react'

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
  userCheckinDates?: Record<string, string>
  friendCheckins: FriendCheckin[]
  isLoggedIn: boolean
  lockedThemeId?: string
  focusLocationId?: string | null
  embedded?: boolean
}

export function MapView({ locations, themes, userCheckinLocationIds, userCheckinPhotos, userCheckinDates, friendCheckins, isLoggedIn, lockedThemeId, focusLocationId, embedded = false }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const clusterRef = useRef<any>(null)
  const plainGroupRef = useRef<any>(null)
  const markersRef = useRef<Map<string, { marker: any; themeId: string }>>(new Map())
  const friendLayerRef = useRef<any[]>([])
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const prevCheckedRef = useRef<Set<string>>(new Set(userCheckinLocationIds))
  const checkedSet = new Set(userCheckinLocationIds)
  const locked = lockedThemeId != null
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(lockedThemeId ?? null)
  const [friendModeOn, setFriendModeOn] = useState(false)
  const [checkinLocationId, setCheckinLocationId] = useState<string | null>(null)
  const [nearbyOpen, setNearbyOpen] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const dict = useDictionary()
  const locale = useLocale()

  const selectTheme = useCallback((id: string | null) => {
    setSelectedThemeId(id)
  }, [])

  // Build the teardrop divIcon for a marker based on its checked state.
  const buildIcon = useCallback((L: any, loc: Location, isChecked: boolean) => {
    const color = loc.themes.color
    return L.divIcon({
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
  }, [])

  // Build popup HTML for a marker based on its checked state + checkin photo.
  const buildPopupHtml = useCallback((loc: Location, isChecked: boolean, photoUrlRaw?: string, dateIso?: string) => {
    const color = loc.themes.color
    const photoUrl = photoUrlRaw?.replace(/"/g, '%22')

    const dateLabel = dateIso
      ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateIso))
      : ''
    const dateChip = dateLabel
      ? `<div style="position:absolute;left:9px;bottom:8px;display:flex;align-items:center;gap:4px;background:rgba(20,35,55,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);color:#fff;font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:7px;pointer-events:none"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span>${dateLabel}</span></div>`
      : ''

    const photoSection = photoUrl
      ? `<div style="position:relative"><img src="${photoUrl}" onclick="document.dispatchEvent(new CustomEvent('open-photo',{detail:{url:'${photoUrl}'}}))" style="width:100%;height:126px;object-fit:cover;display:block;cursor:pointer" /><div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 55%,rgba(20,35,55,.38));pointer-events:none"></div>${dateChip}</div>`
      : ''

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`
    const navIcon = `<a href="${mapsUrl}" target="_blank" rel="noopener" style="position:absolute;top:10px;right:11px;color:#9aa6b6;text-decoration:none;display:grid;place-items:center;opacity:.8"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></a>`
    const checkinBtn = `<button onclick="document.dispatchEvent(new CustomEvent('open-checkin',{detail:{id:'${loc.id}'}}))" style="width:100%;padding:9px 12px;background:#7aa83c;color:#fff;border:none;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;box-shadow:0 6px 14px -6px rgba(122,168,60,.65);box-sizing:border-box"><span>${dict.map.checkin}</span><span style="font-size:10px;background:rgba(255,255,255,.22);padding:2px 7px;border-radius:5px">+${loc.themes.xp_per_checkin} XP</span></button>`
    const visitedBtn = `<button onclick="document.dispatchEvent(new CustomEvent('open-checkin',{detail:{id:'${loc.id}'}}))" style="width:100%;padding:9px 12px;background:#eef3e3;color:#5d7d31;border:none;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg><span>${dict.map.visited}</span></button>`
    const actionBtn = isChecked ? visitedBtn : checkinBtn

    const bodyHtml = photoUrl
      ? `<div style="position:relative;padding:12px 15px 14px">${navIcon}<div style="font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color};margin-bottom:3px">${loc.themes.name}</div><div style="font-size:14.5px;font-weight:700;color:#2d4a6b;line-height:1.25;margin-bottom:${locked ? '0' : '10px'};padding-right:20px">${loc.name}</div>${locked ? '' : actionBtn}</div>`
      : `<div style="position:relative;padding:14px 15px 13px">${navIcon}<div style="display:flex;align-items:stretch;gap:10px;margin-bottom:${locked ? '0' : '11px'}"><div style="width:3px;border-radius:2px;background:${color};flex-shrink:0"></div><div style="min-width:0;padding-right:18px"><div style="font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color};margin-bottom:3px">${loc.themes.name}</div><div style="font-size:14.5px;font-weight:700;color:#2d4a6b;line-height:1.25">${loc.name}</div></div></div>${locked ? '' : actionBtn}</div>`

    return `<div style="width:196px;background:#fbf8f1;font-family:var(--font-sans,'Zen Kaku Gothic New',sans-serif)">${photoSection}${bodyHtml}</div>`
  }, [dict, locked, locale])


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

      const clusterGroup = new MarkerClusterGroup({ showCoverageOnHover: false, chunkedLoading: true, maxClusterRadius: 20 })
      clusterRef.current = clusterGroup

      const plainGroup = L.layerGroup()
      plainGroupRef.current = plainGroup

      const lockedBounds: [number, number][] = []

      locations.forEach(loc => {
        if (locked && loc.theme_id !== lockedThemeId) return

        const isChecked = checkedSet.has(loc.id)

        const marker = L.marker([loc.lat, loc.lng], { icon: buildIcon(L, loc, isChecked) })

        const popupHtml = buildPopupHtml(loc, isChecked, userCheckinPhotos?.[loc.id], userCheckinDates?.[loc.id])

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

    const handleOpenPhoto = (e: Event) => {
      const url = (e as CustomEvent).detail?.url
      if (url) setLightboxUrl(url)
    }
    document.addEventListener('open-photo', handleOpenPhoto)

    return () => {
      cancelled = true
      document.removeEventListener('open-checkin', handleOpenCheckin)
      document.removeEventListener('open-photo', handleOpenPhoto)
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Sync marker visuals when the user's checkin set changes (e.g. right after a
  // checkin triggers router.refresh). Only the markers whose checked state
  // actually flipped are redrawn — the map view, zoom and clusters stay put.
  useEffect(() => {
    const L = leafletRef.current
    if (!L) {
      prevCheckedRef.current = new Set(userCheckinLocationIds)
      return
    }
    const next = new Set(userCheckinLocationIds)
    const prev = prevCheckedRef.current

    markersRef.current.forEach(({ marker }, locId) => {
      const wasChecked = prev.has(locId)
      const isChecked = next.has(locId)
      if (wasChecked === isChecked) return
      const loc = locations.find(l => l.id === locId)
      if (!loc) return
      marker.setIcon(buildIcon(L, loc, isChecked))
      marker.setPopupContent(buildPopupHtml(loc, isChecked, userCheckinPhotos?.[locId], userCheckinDates?.[locId]))
    })

    prevCheckedRef.current = next
  }, [userCheckinLocationIds, userCheckinPhotos, userCheckinDates, locations, buildIcon, buildPopupHtml])

  // Filter markers + fly to bounds when selectedThemeId changes
  useEffect(() => {
    const cluster = clusterRef.current
    const plain = plainGroupRef.current
    const map = mapInstanceRef.current
    if (!cluster || !plain) return

    cluster.clearLayers()
    plain.clearLayers()

    const bounds: [number, number][] = []
    markersRef.current.forEach(({ marker, themeId }) => {
      if (selectedThemeId === null || themeId === selectedThemeId) {
        cluster.addLayer(marker)
        if (selectedThemeId !== null) {
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

      {/* photo lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.85)' }}
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 z-[1001] grid place-items-center w-10 h-10 rounded-full text-white border-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,.16)' }}
            onClick={(e) => { e.stopPropagation(); setLightboxUrl(null) }}
            aria-label={dict.common.close}
          >
            <X size={22} strokeWidth={2.4} />
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,.6)' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
