'use client'

import { useLocale } from '@/lib/i18n/context'
import { locales, type Locale } from '@/lib/i18n/config'

const LABELS: Record<Locale, string> = {
  ja: '日本語',
  en: 'EN',
  zh: '中文',
}

export function LanguageSwitcher() {
  const currentLang = useLocale()

  function switchTo(newLang: Locale) {
    document.cookie = `NEXT_LOCALE=${newLang};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex gap-1">
      {locales.map(lang => (
        <button
          key={lang}
          onClick={() => switchTo(lang)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            lang === currentLang
              ? 'bg-green text-white'
              : 'bg-paper2 text-sub hover:bg-line2'
          }`}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  )
}
