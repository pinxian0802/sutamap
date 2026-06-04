'use client'

import { useEffect, useRef, useState } from 'react'
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
  const mapInstanceRef = useRef<any>(null)
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
      await import('leaflet.markercluster')
      // leaflet.markercluster extends L in-place
      const MarkerClusterGroup = (L as any).MarkerClusterGroup

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
