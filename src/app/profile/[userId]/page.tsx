import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ThemeProgressList } from '@/components/profile/ThemeProgressList'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()
  const locale = await getLocale()

  const [
    { data: profile },
    { data: themes },
    { data: userTitles },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*, titles(name, name_en, name_zh)').eq('id', userId).single() as any,
    supabase.from('themes').select('*') as any,
    supabase.from('user_titles').select('id').eq('user_id', userId) as any,
  ])

  if (!profile) notFound()

  const { data: firstCheckins } = await supabase
    .from('checkins')
    .select('location_id, locations(theme_id)')
    .eq('user_id', userId)
    .eq('is_first', true) as any

  const { data: locationCounts } = await supabase
    .from('locations').select('theme_id').eq('is_active', true) as any

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
    id: theme.uuid, name: localizedName(theme, locale), color: theme.color, icon: theme.icon,
    total: totalPerTheme[theme.theme_id] ?? 0,
    checked: checkedPerTheme[theme.theme_id] ?? 0,
  }))

  const totalSpots = Object.values(totalPerTheme).reduce((a, b) => a + b, 0)
  const totalCheckins = Object.values(checkedPerTheme).reduce((a, b) => a + b, 0)
  const totalTitles = userTitles?.length ?? 0

  const { count: higherXpCount } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .gt('total_xp', profile.total_xp ?? 0) as any
  const rank = (higherXpCount ?? 0) + 1

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <ProfileHeader
        username={profile.username}
        userCode={profile.user_code ?? undefined}
        avatarUrl={profile.avatar_url}
        totalXp={profile.total_xp}
        level={profile.level}
        activeTitle={profile.titles ? localizedName(profile.titles, locale) : null}
        totalCheckins={totalCheckins}
        totalTitles={totalTitles}
        totalSpots={totalSpots}
        rank={rank}
      />
      <ThemeProgressList themes={themeProgress} />
    </div>
  )
}
