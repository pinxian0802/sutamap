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
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(36,52,74,.34)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-paper rounded-t-[22px] transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '92%', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[38px] h-1 rounded-[2px]" style={{ background: '#d8d0bf' }} />
        </div>

        <div className="px-[18px] pt-2 pb-2 flex items-center gap-[13px]">
          <span
            className="w-[52px] h-[52px] rounded-[14px] text-white grid place-items-center flex-shrink-0 text-[22px]"
            style={{ background: color }}
          >
            {location.categories.name.charAt(0)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-bold truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {location.name}
            </div>
            <div className="text-[12.5px] text-sub mt-[2px]">
              {location.categories.name}
            </div>
          </div>
          <button className="sm-iconbtn" onClick={handleClose}>
            <span className="text-[20px] leading-none text-sub">×</span>
          </button>
        </div>

        <div className="px-[18px] pb-6 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 100px)' }}>
          {/* stats */}
          <div className="flex gap-[10px] mb-4">
            {[
              { k: 'XP', v: `+${location.categories.xp_per_checkin}`, highlight: true },
              { k: '半徑', v: `${location.categories.checkin_radius_meters}m` },
            ].map((s, i) => (
              <div key={i} className="flex-1 text-center bg-paper2 rounded-[13px] py-3 px-1">
                <div className="sm-mono text-[17px] font-bold" style={{ color: s.highlight ? 'var(--green-d)' : 'var(--ink)' }}>
                  {s.v}
                </div>
                <div className="text-[10.5px] text-sub mt-[3px]">{s.k}</div>
              </div>
            ))}
          </div>

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
