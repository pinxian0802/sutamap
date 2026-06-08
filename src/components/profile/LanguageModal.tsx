'use client'

import { useLocale, useDictionary } from '@/lib/i18n/context'
import { locales, type Locale } from '@/lib/i18n/config'
import { Modal } from '@/components/ui/Modal'

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

  function switchLocale(lang: Locale) {
    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <Modal title={dict.profile.language} onClose={onClose}>
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
    </Modal>
  )
}
