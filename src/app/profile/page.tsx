import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilePageClient } from '@/components/profile/ProfilePageClient'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const locale = await getLocale()

  const [
    { data: profile },
    { data: userTitles },
    { data: themes },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*, titles(name, name_en, name_zh)').eq('id', user.id).single() as any,
    supabase.from('user_titles').select('titles(*)').eq('user_id', user.id) as any,
    supabase.from('themes').select('*') as any,
  ])

  const { data: firstCheckins } = await supabase
    .from('checkins')
    .select('location_id, locations(theme_id)')
    .eq('user_id', user.id)
    .eq('is_first', true) as any

  const { data: locationCounts } = await supabase
    .from('locations')
    .select('theme_id')
    .eq('is_active', true) as any

  const totalPerTheme: Record<string, number> = {}
  locationCounts?.forEach((l: any) => {
    totalPerTheme[l.theme_id] = (totalPerTheme[l.theme_id] ?? 0) + 1
  })

  const checkedPerTheme: Record<string, number> = {}
  firstCheckins?.forEach((c: any) => {
    const themeId = c.locations?.theme_id
    if (themeId) checkedPerTheme[themeId] = (checkedPerTheme[themeId] ?? 0) + 1
  })

  const themeProgress = (themes ?? []).map((theme: any) => ({
    id: theme.uuid,
    name: localizedName(theme, locale),
    color: theme.color,
    icon: theme.icon,
    total: totalPerTheme[theme.theme_id] ?? 0,
    checked: checkedPerTheme[theme.theme_id] ?? 0,
  }))

  const earnedTitles = (userTitles?.map((ut: any) => ut.titles).filter(Boolean) ?? [])
    .map((t: any) => ({ ...t, name: localizedName(t, locale) }))

  const totalSpots = Object.values(totalPerTheme).reduce((a, b) => a + b, 0)
  const totalCheckins = Object.values(checkedPerTheme).reduce((a, b) => a + b, 0)

  const localizedProfile = profile ? {
    ...profile,
    titles: profile.titles ? { ...profile.titles, name: localizedName(profile.titles, locale) } : null,
  } : profile

  return (
    <ProfilePageClient
      profile={localizedProfile}
      earnedTitles={earnedTitles}
      themeProgress={themeProgress}
      totalCheckins={totalCheckins}
      totalSpots={totalSpots}
    />
  )
}
