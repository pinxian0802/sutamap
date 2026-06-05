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
    { data: allBadges },
    { data: userBadges },
    { data: userTitles },
    { data: categories },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*, titles(name, name_en, name_zh)').eq('id', user.id).single() as any,
    supabase.from('badges').select('*') as any,
    supabase.from('user_badges').select('badges(*)').eq('user_id', user.id) as any,
    supabase.from('user_titles').select('titles(*)').eq('user_id', user.id) as any,
    supabase.from('categories').select('*') as any,
  ])

  const { data: firstCheckins } = await supabase
    .from('checkins')
    .select('location_id, locations(category_id)')
    .eq('user_id', user.id)
    .eq('is_first', true) as any

  const { data: locationCounts } = await supabase
    .from('locations')
    .select('category_id')
    .eq('is_active', true) as any

  const totalPerCategory: Record<string, number> = {}
  locationCounts?.forEach((l: any) => {
    totalPerCategory[l.category_id] = (totalPerCategory[l.category_id] ?? 0) + 1
  })

  const checkedPerCategory: Record<string, number> = {}
  firstCheckins?.forEach((c: any) => {
    const catId = c.locations?.category_id
    if (catId) checkedPerCategory[catId] = (checkedPerCategory[catId] ?? 0) + 1
  })

  const categoryProgress = (categories ?? []).map((cat: any) => ({
    id: cat.id,
    name: localizedName(cat, locale),
    color: cat.color,
    icon: cat.icon,
    total: totalPerCategory[cat.id] ?? 0,
    checked: checkedPerCategory[cat.id] ?? 0,
  }))

  const earnedBadges = (userBadges?.map((ub: any) => ub.badges).filter(Boolean) ?? [])
    .map((b: any) => ({ ...b, name: localizedName(b, locale) }))
  const earnedTitles = (userTitles?.map((ut: any) => ut.titles).filter(Boolean) ?? [])
    .map((t: any) => ({ ...t, name: localizedName(t, locale) }))

  const totalSpots = Object.values(totalPerCategory).reduce((a, b) => a + b, 0)
  const totalCheckins = Object.values(checkedPerCategory).reduce((a, b) => a + b, 0)

  const localizedProfile = profile ? {
    ...profile,
    titles: profile.titles ? { ...profile.titles, name: localizedName(profile.titles, locale) } : null,
  } : profile

  const localizedAllBadges = (allBadges ?? []).map((b: any) => ({ ...b, name: localizedName(b, locale) }))

  return (
    <ProfilePageClient
      profile={localizedProfile}
      earnedBadges={earnedBadges}
      allBadges={localizedAllBadges}
      earnedTitles={earnedTitles}
      categoryProgress={categoryProgress}
      totalCheckins={totalCheckins}
      totalSpots={totalSpots}
    />
  )
}
