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

  const { data: stats } = await supabase.rpc('get_profile_stats', { p_user_id: user.id }) as any
  if (!stats?.profile) redirect('/auth/login')

  const profile = {
    ...stats.profile,
    titles: stats.profile.titles
      ? { ...stats.profile.titles, name: localizedName(stats.profile.titles, locale) }
      : null,
  }

  const earnedTitles = (stats.earned_titles ?? []).map((t: any) => ({
    ...t,
    name: localizedName(t, locale),
  }))

  const themeProgress = (stats.theme_progress ?? []).map((t: any) => ({
    id: t.uuid,
    name: localizedName(t, locale),
    color: t.color,
    icon: t.icon,
    total: t.total,
    checked: t.checked,
  }))

  const totalCheckins = themeProgress.reduce((a: number, t: any) => a + t.checked, 0)
  const totalSpots = themeProgress.reduce((a: number, t: any) => a + t.total, 0)

  return (
    <ProfilePageClient
      profile={profile}
      earnedTitles={earnedTitles}
      themeProgress={themeProgress}
      totalCheckins={totalCheckins}
      totalSpots={totalSpots}
      rank={stats.profile.rank}
    />
  )
}
