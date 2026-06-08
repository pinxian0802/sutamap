'use client'

import { useState, useEffect } from 'react'
import { useDictionary, useLocale } from '@/lib/i18n/context'
import { locales, type Locale } from '@/lib/i18n/config'
import { X } from 'lucide-react'

const LANG_LABELS: Record<Locale, string> = {
  ja: '日本語',
  en: 'EN',
  zh: '中文',
}

interface Props {
  onClose: () => void
}

export function LanguageModal({ onClose }: Props) {
  const dict = useDictionary()
  const currentLocale = useLocale()
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

  function switchLocale(lang: Locale) {
    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`
    window.location.reload()
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
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[38px] h-1 rounded-[2px]" style={{ background: '#d8d0bf' }} />
        </div>

        <div className="flex items-center justify-between px-[18px] pt-2 pb-4">
          <h2 className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {dict.profile.language}
          </h2>
          <button className="sm-iconbtn" onClick={handleClose}>
            <X size={18} className="text-sub" />
          </button>
        </div>

        <div className="px-[18px] pb-10 flex flex-col gap-2">
          {locales.map(lang => (
            <button
              key={lang}
              onClick={() => switchLocale(lang)}
              className={`w-full py-3 rounded-[12px] text-[15px] font-semibold transition-colors ${
                lang === currentLocale
                  ? 'bg-green text-white'
                  : 'bg-paper2 text-main hover:bg-line'
              }`}
            >
              {LANG_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
