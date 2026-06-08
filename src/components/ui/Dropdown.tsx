'use client'

import { useState, useRef, useEffect, createContext, useContext } from 'react'

const DropdownContext = createContext<{ close: () => void } | null>(null)

function useDropdown() {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('DropdownItem must be used inside Dropdown')
  return ctx
}

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  minWidth?: number
}

export function Dropdown({ trigger, children, align = 'right', minWidth = 200 }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && (
        <DropdownContext.Provider value={{ close: () => setOpen(false) }}>
          <div
            className="absolute top-full mt-1 bg-paper border border-line rounded-[11px] shadow-md p-1.5 z-50"
            style={{ minWidth, [align === 'right' ? 'right' : 'left']: 0 }}
          >
            {children}
          </div>
        </DropdownContext.Provider>
      )}
    </div>
  )
}

interface DropdownItemProps {
  onClick?: () => void
  children: React.ReactNode
}

export function DropdownItem({ onClick, children }: DropdownItemProps) {
  const { close } = useDropdown()

  return (
    <button
      className="w-full text-left px-4 py-2 text-sm hover:bg-paper2 transition-colors rounded-[8px]"
      onClick={() => { close(); onClick?.() }}
    >
      {children}
    </button>
  )
}
