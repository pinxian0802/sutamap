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

  const { data: stats } = await supabase.rpc('get_profile_stats', { p_user_id: userId }) as any
  if (!stats?.profile) notFound()

  const profile = stats.profile
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
  const totalTitles = (stats.earned_titles ?? []).length

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
        rank={profile.rank}
      />
      <ThemeProgressList themes={themeProgress} />
    </div>
  )
}
