import { createClient } from '@/lib/supabase/server'
import { ThemesPageClient } from '@/components/themes/ThemesPageClient'
import { Target } from 'lucide-react'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

export default async function ThemesPage() {
  const supabase = await createClient()
  const locale = await getLocale()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: themes }, { data: locations }] = await Promise.all([
    supabase.from('themes').select('*') as any,
    supabase.from('locations').select('id, theme_id').eq('is_active', true) as any,
  ])

  const totalPerTheme: Record<string, number> = {}
  locations?.forEach((l: any) => {
    totalPerTheme[l.theme_id] = (totalPerTheme[l.theme_id] ?? 0) + 1
  })

  let checkedPerTheme: Record<string, number> = {}
  let friendsPerTheme: Record<string, { userId: string; username: string; checked: number }[]> = {}

  if (user) {
    const { data: myCheckins } = await supabase
      .from('checkins')
      .select('location_id, locations(theme_id)')
      .eq('user_id', user.id)
      .eq('is_first', true) as any

    myCheckins?.forEach((c: any) => {
      const themeId = c.locations?.theme_id
      if (themeId) checkedPerTheme[themeId] = (checkedPerTheme[themeId] ?? 0) + 1
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
          .select('location_id, locations(theme_id)')
          .eq('user_id', friend.id)
          .eq('is_first', true) as any

        const fPerTheme: Record<string, number> = {}
        fCheckins?.forEach((c: any) => {
          const themeId = c.locations?.theme_id
          if (themeId) fPerTheme[themeId] = (fPerTheme[themeId] ?? 0) + 1
        })

        Object.entries(fPerTheme).forEach(([themeId, count]) => {
          if (!friendsPerTheme[themeId]) friendsPerTheme[themeId] = []
          friendsPerTheme[themeId].push({ userId: friend.id, username: friend.username, checked: count })
        })
      }
    }
  }

  const themeData = (themes ?? []).map((theme: any) => ({
    id: theme.uuid,
    theme_id: theme.theme_id,
    name: localizedName(theme, locale),
    description: theme.description,
    color: theme.color,
    icon: theme.icon,
    total: totalPerTheme[theme.uuid] ?? 0,
    checked: checkedPerTheme[theme.uuid] ?? 0,
    xpPerCheckin: theme.xp_per_checkin,
    friends: friendsPerTheme[theme.uuid] ?? [],
  }))

  return <ThemesPageClient themes={themeData} />
}
