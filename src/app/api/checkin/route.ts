import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { haversineDistance } from '@/lib/geo/distance'
import { xpToLevel } from '@/lib/xp/calculator'

type LocationRow = {
  id: string
  category_id: string
  name: string
  lat: number
  lng: number
  categories: {
    name: string
    color: string
    checkin_radius_meters: number
    xp_per_checkin: number
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { locationId, photoUrl, lat, lng } = await request.json()

  // Fetch location + category
  const { data: location } = await supabase
    .from('locations')
    .select('*, categories(*)')
    .eq('id', locationId)
    .single() as { data: LocationRow | null; error: unknown }

  if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  const distance = Math.round(haversineDistance(lat, lng, location.lat, location.lng))
  const radius = location.categories.checkin_radius_meters
  if (distance > radius) {
    return NextResponse.json(
      { error: 'Too far', distance, required: radius },
      { status: 422 }
    )
  }

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
  let newBadge = null
  let newTitle = null

  if (isFirst) {
    const xpGain = location.categories.xp_per_checkin

    // Update user XP
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_xp')
      .eq('id', user.id)
      .single() as { data: { total_xp: number } | null; error: unknown }

    const newXp = (profile?.total_xp ?? 0) + xpGain
    const newLevel = xpToLevel(newXp)

    await (supabase as any)
      .from('user_profiles')
      .update({ total_xp: newXp, level: newLevel })
      .eq('id', user.id)

    xpAwarded = xpGain

    // Fetch all active locations in category
    const { data: categoryLocations } = await supabase
      .from('locations')
      .select('id')
      .eq('category_id', location.category_id)
      .eq('is_active', true) as { data: { id: string }[] | null; error: unknown }

    const locationIds = categoryLocations?.map(l => l.id) ?? []

    const { count: totalLocations } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', location.category_id)
      .eq('is_active', true)

    const { count: userCheckins } = await supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_first', true)
      .in('location_id', locationIds)

    if (totalLocations === userCheckins) {
      // Award badge
      const { data: badge } = await supabase
        .from('badges')
        .select('*')
        .eq('category_id', location.category_id)
        .maybeSingle() as { data: { id: string; name: string; icon: string } | null; error: unknown }

      if (badge) {
        await supabase.from('user_badges').upsert({ user_id: user.id, badge_id: badge.id } as any)
        newBadge = badge
      }

      // Award title
      const { data: title } = await supabase
        .from('titles')
        .select('*')
        .eq('category_id', location.category_id)
        .maybeSingle() as { data: { id: string; name: string } | null; error: unknown }

      if (title) {
        await supabase.from('user_titles').upsert({ user_id: user.id, title_id: title.id } as any)
        newTitle = title
      }
    }
  }

  return NextResponse.json({ success: true, isFirst, xpAwarded, newBadge, newTitle, distance })
}
