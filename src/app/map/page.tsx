import { createClient } from '@/lib/supabase/server'
import { MapView } from '@/components/map/MapView'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

const FRIEND_COLORS = ['#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1']

export default async function MapPage() {
  const supabase = await createClient()
  const locale = await getLocale()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: locations }, { data: themes }] = await Promise.all([
    supabase.from('locations').select('*, themes(name, color, icon, checkin_radius_meters, xp_per_checkin)').eq('is_active', true),
    supabase.from('themes').select('*'),
  ])

  let userCheckinLocationIds: string[] = []
  let friendCheckins: { locationId: string; userId: string; username: string; color: string }[] = []

  if (user) {
    const { data: checkins } = await supabase
      .from('checkins')
      .select('location_id')
      .eq('user_id', user.id)
      .eq('is_first', true) as { data: { location_id: string }[] | null; error: unknown }
    userCheckinLocationIds = checkins?.map(c => c.location_id) ?? []

    const { data: friendships } = await (supabase as any)
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendIds = ((friendships ?? []) as any[]).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    if (friendIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from('user_profiles')
        .select('id, username')
        .in('id', friendIds) as { data: { id: string; username: string }[] | null; error: unknown }

      const { data: fCheckins } = await (supabase as any)
        .from('checkins')
        .select('location_id, user_id')
        .in('user_id', friendIds)
        .eq('is_first', true)

      friendCheckins = ((fCheckins ?? []) as any[]).map((c: any) => {
        const profile = friendProfiles?.find(p => p.id === c.user_id)
        const colorIdx = friendIds.indexOf(c.user_id) % FRIEND_COLORS.length
        return {
          locationId: c.location_id,
          userId: c.user_id,
          username: profile?.username ?? '?',
          color: FRIEND_COLORS[colorIdx],
        }
      })
    }
  }

  const localizedLocations = (locations ?? []).map((loc: any) => ({
    ...loc,
    name: localizedName(loc, locale),
    themes: { ...loc.themes, name: localizedName(loc.themes, locale) },
  }))

  const localizedThemes = (themes ?? []).map((theme: any) => ({
    ...theme,
    name: localizedName(theme, locale),
  }))

  return (
    <MapView
      locations={localizedLocations}
      themes={localizedThemes}
      userCheckinLocationIds={userCheckinLocationIds}
      friendCheckins={friendCheckins}
      isLoggedIn={!!user}
    />
  )
}
