import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { CategoryProgressList } from '@/components/profile/CategoryProgressList'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()
  const locale = await getLocale()

  const [
    { data: profile },
    { data: categories },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*, titles(name, name_en, name_zh)').eq('id', userId).single() as any,
    supabase.from('categories').select('*') as any,
  ])

  if (!profile) notFound()

  const { data: firstCheckins } = await supabase
    .from('checkins')
    .select('location_id, locations(category_id)')
    .eq('user_id', userId)
    .eq('is_first', true) as any

  const { data: locationCounts } = await supabase
    .from('locations').select('category_id').eq('is_active', true) as any

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
    id: cat.id, name: localizedName(cat, locale), color: cat.color, icon: cat.icon,
    total: totalPerCategory[cat.id] ?? 0,
    checked: checkedPerCategory[cat.id] ?? 0,
  }))

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <ProfileHeader
        username={profile.username}
        userCode={profile.user_code ?? undefined}
        avatarUrl={profile.avatar_url}
        totalXp={profile.total_xp}
        level={profile.level}
        activeTitle={profile.titles ? localizedName(profile.titles, locale) : null}
      />
      <CategoryProgressList categories={categoryProgress} />
    </div>
  )
}
