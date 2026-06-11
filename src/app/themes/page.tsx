import { createClient } from '@/lib/supabase/server'
import { ThemesPageClient } from '@/components/themes/ThemesPageClient'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

export default async function ThemesPage() {
  const supabase = await createClient()
  const locale = await getLocale()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: themes }, { data: locationCounts }] = await Promise.all([
    supabase.from('themes').select('*') as any,
    supabase.rpc('get_location_counts_by_theme') as any,
  ])

  const totalPerTheme: Record<string, number> = {}
  ;(locationCounts ?? []).forEach((row: any) => {
    totalPerTheme[row.theme_id] = Number(row.cnt)
  })

  let checkedPerTheme: Record<string, number> = {}
  let friendsPerTheme: Record<string, { userId: string; username: string; checked: number }[]> = {}

  if (user) {
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted') as any

    const friendIds: string[] = (friendships ?? []).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    const queries: Promise<any>[] = [
      supabase.from('checkins').select('locations(theme_id)').eq('user_id', user.id).eq('is_first', true) as any,
    ]
    if (friendIds.length > 0) {
      queries.push(
        supabase.from('user_profiles').select('id, username').in('id', friendIds) as any,
        supabase.from('checkins').select('user_id, locations(theme_id)').in('user_id', friendIds).eq('is_first', true) as any,
      )
    }

    const [myCheckinsRes, friendProfilesRes, friendCheckinsRes] = await Promise.all(queries)

    ;(myCheckinsRes?.data ?? []).forEach((c: any) => {
      const themeId = c.locations?.theme_id
      if (themeId) checkedPerTheme[themeId] = (checkedPerTheme[themeId] ?? 0) + 1
    })

    if (friendIds.length > 0) {
      const profileMap: Record<string, string> = {}
      ;(friendProfilesRes?.data ?? []).forEach((p: any) => { profileMap[p.id] = p.username })

      const countMap: Record<string, Record<string, number>> = {}
      ;(friendCheckinsRes?.data ?? []).forEach((c: any) => {
        const themeId = c.locations?.theme_id
        if (!themeId || !profileMap[c.user_id]) return
        if (!countMap[themeId]) countMap[themeId] = {}
        countMap[themeId][c.user_id] = (countMap[themeId][c.user_id] ?? 0) + 1
      })

      Object.entries(countMap).forEach(([themeId, userCounts]) => {
        friendsPerTheme[themeId] = Object.entries(userCounts).map(([userId, checked]) => ({
          userId,
          username: profileMap[userId] ?? '?',
          checked,
        }))
      })
    }
  }

  const themeData = (themes ?? []).map((theme: any) => ({
    id: theme.uuid,
    theme_id: theme.theme_id,
    name: localizedName(theme, locale),
    description: theme.description,
    color: theme.color,
    icon: theme.icon,
    total: totalPerTheme[theme.theme_id] ?? 0,
    checked: checkedPerTheme[theme.theme_id] ?? 0,
    xpPerCheckin: theme.xp_per_checkin,
    friends: friendsPerTheme[theme.theme_id] ?? [],
  }))

  return <ThemesPageClient themes={themeData} />
}
