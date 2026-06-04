import { createClient } from '@/lib/supabase/server'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'

export default async function CategoriesPage() {
  const dict = await getDictionary(await getLocale())
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: categories }, { data: locations }] = await Promise.all([
    supabase.from('categories').select('*') as any,
    supabase.from('locations').select('id, category_id').eq('is_active', true) as any,
  ])

  const totalPerCategory: Record<string, number> = {}
  locations?.forEach((l: any) => {
    totalPerCategory[l.category_id] = (totalPerCategory[l.category_id] ?? 0) + 1
  })

  let checkedPerCategory: Record<string, number> = {}
  let friendsPerCategory: Record<string, { userId: string; username: string; checked: number }[]> = {}

  if (user) {
    const { data: myCheckins } = await supabase
      .from('checkins')
      .select('location_id, locations(category_id)')
      .eq('user_id', user.id)
      .eq('is_first', true) as any

    myCheckins?.forEach((c: any) => {
      const catId = c.locations?.category_id
      if (catId) checkedPerCategory[catId] = (checkedPerCategory[catId] ?? 0) + 1
    })

    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted') as any

    const friendIds = friendships?.map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    ) ?? []

    if (friendIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from('user_profiles')
        .select('id, username')
        .in('id', friendIds) as any

      for (const friend of friendProfiles ?? []) {
        const { data: fCheckins } = await supabase
          .from('checkins')
          .select('location_id, locations(category_id)')
          .eq('user_id', friend.id)
          .eq('is_first', true) as any

        const fPerCat: Record<string, number> = {}
        fCheckins?.forEach((c: any) => {
          const catId = c.locations?.category_id
          if (catId) fPerCat[catId] = (fPerCat[catId] ?? 0) + 1
        })

        Object.entries(fPerCat).forEach(([catId, count]) => {
          if (!friendsPerCategory[catId]) friendsPerCategory[catId] = []
          friendsPerCategory[catId].push({ userId: friend.id, username: friend.username, checked: count })
        })
      }
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">{dict.categories.title}</h1>
      {(categories ?? []).map((cat: any) => (
        <CategoryCard
          key={cat.id}
          id={cat.id}
          name={cat.name}
          description={cat.description}
          color={cat.color}
          icon={cat.icon}
          total={totalPerCategory[cat.id] ?? 0}
          checked={checkedPerCategory[cat.id] ?? 0}
          xpPerCheckin={cat.xp_per_checkin}
          friends={friendsPerCategory[cat.id] ?? []}
        />
      ))}
    </div>
  )
}
