import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { BadgeWall } from '@/components/profile/BadgeWall'
import { TitleSelector } from '@/components/profile/TitleSelector'
import { CategoryProgressList } from '@/components/profile/CategoryProgressList'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: profile },
    { data: allBadges },
    { data: userBadges },
    { data: userTitles },
    { data: categories },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*, titles(name)').eq('id', user.id).single() as any,
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
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    total: totalPerCategory[cat.id] ?? 0,
    checked: checkedPerCategory[cat.id] ?? 0,
  }))

  const earnedBadges = userBadges?.map((ub: any) => ub.badges).filter(Boolean) ?? []
  const earnedTitles = userTitles?.map((ut: any) => ut.titles).filter(Boolean) ?? []

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <ProfileHeader
        username={profile?.username ?? ''}
        totalXp={profile?.total_xp ?? 0}
        level={profile?.level ?? 1}
        activeTitle={profile?.titles?.name}
      />
      <TitleSelector
        earnedTitles={earnedTitles}
        activeTitleId={profile?.active_title_id ?? null}
      />
      <BadgeWall earnedBadges={earnedBadges} allBadges={allBadges ?? []} />
      <CategoryProgressList categories={categoryProgress} />
    </div>
  )
}
