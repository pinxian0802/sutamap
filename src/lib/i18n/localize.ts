import type { Locale } from './config'

export function localizedName(
  item: { name: string; name_en?: string | null; name_zh?: string | null },
  locale: Locale
): string {
  if (locale === 'en') return item.name_en || item.name
  if (locale === 'zh') return item.name_zh || item.name
  return item.name
}
