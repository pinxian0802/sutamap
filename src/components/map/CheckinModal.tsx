'use client'

import { CheckinFlow } from '@/components/checkin/CheckinFlow'
import { Modal } from '@/components/ui/Modal'

interface CheckinLocation {
  id: string
  name: string
  lat: number
  lng: number
  themes: {
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
  const color = location.themes.color

  return (
    <Modal
      onClose={onClose}
      minHeight="80vh"
      maxHeight="92vh"
      header={(handleClose) => (
        <div className="px-[18px] pt-2 pb-2 flex items-center gap-[13px]">
          <span
            className="w-[52px] h-[52px] rounded-[14px] text-white grid place-items-center flex-shrink-0 text-[22px]"
            style={{ background: color }}
          >
            {location.themes.name.charAt(0)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-bold truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {location.name}
            </div>
            <div className="text-[12.5px] text-sub mt-[2px]">
              {location.themes.name}
            </div>
          </div>
          <button className="sm-iconbtn" onClick={handleClose}>
            <span className="text-[20px] leading-none text-sub">×</span>
          </button>
        </div>
      )}
    >
      <div className="px-[18px] pb-6 overflow-hidden" style={{ maxHeight: 'calc(92vh - 100px)' }}>
        <div className="flex gap-[10px] mb-4">
          {[
            { k: 'XP', v: `+${location.themes.xp_per_checkin}`, highlight: true },
            { k: '半徑', v: `${location.themes.checkin_radius_meters}m` },
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
          onComplete={onClose}
        />
      </div>
    </Modal>
  )
}
