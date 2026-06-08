'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  title?: string
  header?: (handleClose: () => void) => React.ReactNode
  onClose: () => void
  children: React.ReactNode
  minHeight?: string
  maxHeight?: string
}

export function Modal({ title, header, onClose, children, minHeight, maxHeight }: Props) {
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

  return (
    <div className="fixed inset-0 z-[700]">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(36,52,74,.34)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-paper rounded-t-[22px] transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ minHeight, maxHeight, boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[38px] h-1 rounded-[2px]" style={{ background: '#d8d0bf' }} />
        </div>

        {header ? header(handleClose) : (
          <div className="flex items-center justify-between px-[18px] pt-2 pb-4">
            <h2 className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {title}
            </h2>
            <button className="sm-iconbtn" onClick={handleClose}>
              <X size={18} className="text-sub" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
