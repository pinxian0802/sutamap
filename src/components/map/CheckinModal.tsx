'use client'

import { useState, useEffect } from 'react'
import { CheckinFlow } from '@/components/checkin/CheckinFlow'

interface CheckinLocation {
  id: string
  name: string
  lat: number
  lng: number
  categories: {
    name: string
    color: string
    checkin_radius_meters: number
    xp_per_checkin: number
  }
}

interface Props {
  location: CheckinLocation
  isLoggedIn: boolean
  alreadyCheckedIn: boolean
  onClose: () => void
}

export function CheckinModal({ location, isLoggedIn, alreadyCheckedIn, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const color = location.categories.color

  return (
    <div className="fixed inset-0 z-[700]">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="mx-5 h-0.5 rounded-full opacity-60" style={{ background: color }} />

        <div className="px-5 pt-4 pb-2 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color }}
            >
              {location.categories.name}
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5 truncate">
              {location.name}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="ml-3 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          <CheckinFlow
            location={location}
            isLoggedIn={isLoggedIn}
            alreadyCheckedIn={alreadyCheckedIn}
            onComplete={handleClose}
          />
        </div>
      </div>
    </div>
  )
}
