import type { Locale } from './config'

const dictionaries = {
  ja: () => import('./dictionaries/ja.json').then(m => m.default),
  en: () => import('./dictionaries/en.json').then(m => m.default),
  zh: () => import('./dictionaries/zh.json').then(m => m.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
