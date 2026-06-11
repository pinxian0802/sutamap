import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ThemeDetailClient, type DetailLocation, type DetailFriend } from '@/components/themes/ThemeDetailClient'
import { getLocale } from '@/lib/i18n/server'
import { localizedName } from '@/lib/i18n/localize'

export default async function ThemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const locale = await getLocale()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: theme }, { data: locations }] = await Promise.all([
    supabase.from('themes').select('*').eq('theme_id', id).single() as any,
    supabase.rpc('get_locations_for_theme', { p_theme_id: id }) as any,
  ])

  if (!theme) notFound()

  const locationIds: string[] = (locations ?? []).map((l: any) => l.id)

  let checkedSet = new Set<string>()
  let checkinPhotos: Record<string, string> = {}
  let friends: DetailFriend[] = []

  if (user && locationIds.length > 0) {
    const [{ data: myCheckins }, { data: friendships }] = await Promise.all([
      supabase.from('checkins').select('location_id, photo_url').eq('user_id', user.id).eq('is_first', true).in('location_id', locationIds) as any,
      supabase.from('friendships').select('requester_id, addressee_id').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq('status', 'accepted') as any,
    ])

    checkedSet = new Set<string>((myCheckins ?? []).map((c: any) => c.location_id))
    ;(myCheckins ?? []).forEach((c: any) => { if (c.photo_url) checkinPhotos[c.location_id] = c.photo_url })

    const friendIds: string[] = (friendships ?? []).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    if (friendIds.length > 0) {
      const [{ data: friendProfiles }, { data: fCheckins }] = await Promise.all([
        supabase.from('user_profiles').select('id, username').in('id', friendIds) as any,
        supabase.from('checkins').select('location_id, user_id').eq('is_first', true).in('user_id', friendIds).in('location_id', locationIds) as any,
      ])

      const countByFriend: Record<string, number> = {}
      ;(fCheckins ?? []).forEach((c: any) => {
        countByFriend[c.user_id] = (countByFriend[c.user_id] ?? 0) + 1
      })

      friends = Object.entries(countByFriend).map(([userId, checked]) => ({
        userId,
        username: (friendProfiles ?? []).find((p: any) => p.id === userId)?.username ?? '?',
        checked,
      }))
    }
  }

  const localizedTheme = {
    uuid: theme.uuid,
    theme_id: theme.theme_id,
    name: localizedName(theme, locale),
    description: theme.description,
    color: theme.color,
    icon: theme.icon,
    xp_per_checkin: theme.xp_per_checkin,
  }

  const detailLocations: DetailLocation[] = (locations ?? []).map((loc: any) => ({
    id: loc.id,
    name: localizedName(loc, locale),
    prefecture: loc.prefecture,
    lat: loc.lat,
    lng: loc.lng,
    theme_id: loc.theme_id,
    themes: {
      uuid: theme.uuid,
      name: localizedTheme.name,
      color: theme.color,
      icon: theme.icon,
      checkin_radius_meters: theme.checkin_radius_meters,
      xp_per_checkin: theme.xp_per_checkin,
    },
    checked: checkedSet.has(loc.id),
  }))

  return (
    <ThemeDetailClient
      theme={localizedTheme}
      locations={detailLocations}
      checkedCount={detailLocations.filter(l => l.checked).length}
      friends={friends}
      isLoggedIn={!!user}
      userCheckinPhotos={checkinPhotos}
    />
  )
}
