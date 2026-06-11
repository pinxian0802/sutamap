import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { haversineDistance } from '@/lib/geo/distance'
import { xpToLevel, xpToNextLevel } from '@/lib/xp/calculator'
import { localizedName } from '@/lib/i18n/localize'
import type { Locale } from '@/lib/i18n/config'
import { defaultLocale } from '@/lib/i18n/config'

type LocationRow = {
  id: string
  theme_id: string
  name: string
  lat: number
  lng: number
  themes: {
    name: string
    color: string
    checkin_radius_meters: number
    xp_per_checkin: number
  }
}

export async function POST(request: NextRequest) {
  const locale = (request.headers.get('x-locale') as Locale) ?? defaultLocale
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { locationId, photoUrl, lat, lng } = await request.json()

  // Fetch location + theme
  const { data: location } = await supabase
    .from('locations')
    .select('*, themes(*)')
    .eq('id', locationId)
    .single() as { data: LocationRow | null; error: unknown }

  if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  // DEV: 距離檢查暫時關閉（測試用）
  const distance = Math.round(haversineDistance(lat, lng, location.lat, location.lng))

  // Check if first check-in
  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('user_id', user.id)
    .eq('location_id', locationId)
    .eq('is_first', true)
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  const isFirst = !existing

  // Insert check-in
  const { error: checkinError } = await supabase
    .from('checkins')
    .insert({
      user_id: user.id,
      location_id: locationId,
      photo_url: photoUrl,
      checkin_lat: lat,
      checkin_lng: lng,
      distance_meters: distance,
      is_first: isFirst,
    } as any)

  if (checkinError) return NextResponse.json({ error: (checkinError as any).message }, { status: 500 })

  let xpAwarded = 0
  let newTitle = null
  let leveledUp = false
  let prevLevel = 0
  let newLevel = 0
  let xpBefore = 0
  let xpMax = 100

  if (isFirst) {
    const xpGain = location.themes.xp_per_checkin

    // Update user XP
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_xp')
      .eq('id', user.id)
      .single() as { data: { total_xp: number } | null; error: unknown }

    const oldXp = profile?.total_xp ?? 0
    prevLevel = xpToLevel(oldXp)
    const prevProgress = xpToNextLevel(oldXp)
    xpBefore = prevProgress.current
    xpMax = prevProgress.needed

    const newXp = oldXp + xpGain
    newLevel = xpToLevel(newXp)
    leveledUp = newLevel > prevLevel

    await (supabase as any)
      .from('user_profiles')
      .update({ total_xp: newXp, level: newLevel })
      .eq('id', user.id)

    xpAwarded = xpGain

    // Fetch all active locations in theme
    const { data: themeLocations } = await supabase
      .from('locations')
      .select('id')
      .eq('theme_id', location.theme_id)
      .eq('is_active', true) as { data: { id: string }[] | null; error: unknown }

    const locationIds = themeLocations?.map(l => l.id) ?? []

    const { count: totalLocations } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('theme_id', location.theme_id)
      .eq('is_active', true)

    const { count: userCheckins } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_first', true)
      .in('location_id', locationIds)

    if (totalLocations === userCheckins) {
      // Award title
      const { data: title } = await supabase
        .from('titles')
        .select('*')
        .eq('theme_id', location.theme_id)
        .maybeSingle() as { data: { id: string; name: string; name_en?: string; name_zh?: string } | null; error: unknown }

      if (title) {
        const { error: titleError } = await supabase.from('user_titles').upsert({ user_id: user.id, title_id: title.id } as any)
        if (!titleError) newTitle = { ...title, name: localizedName(title, locale) }
      }
    }
  }

  return NextResponse.json({
    success: true, isFirst, xpAwarded, newTitle, distance,
    leveledUp, prevLevel, newLevel, xpBefore, xpMax,
  })
}
