'use client'

import { createContext, useContext } from 'react'
import type { Locale } from './config'
import type { Dictionary } from './dictionaries'

interface I18nContextValue {
  dict: Dictionary
  lang: Locale
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  children,
  dict,
  lang,
}: {
  children: React.ReactNode
  dict: Dictionary
  lang: Locale
}) {
  return (
    <I18nContext.Provider value={{ dict, lang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useDictionary(): Dictionary {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useDictionary must be used within I18nProvider')
  return ctx.dict
}

export function useLocale(): Locale {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLocale must be used within I18nProvider')
  return ctx.lang
}

export function formatTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}
