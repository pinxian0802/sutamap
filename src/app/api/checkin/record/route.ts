import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Returns the user's first check-in record for a location (photo + date),
// used to show "already visited" details when re-checkin is blocked.
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const locationId = request.nextUrl.searchParams.get('locationId')
  if (!locationId) return NextResponse.json({ error: 'Missing locationId' }, { status: 400 })

  const { data } = await supabase
    .from('checkins')
    .select('photo_url, created_at')
    .eq('user_id', user.id)
    .eq('location_id', locationId)
    .eq('is_first', true)
    .maybeSingle() as { data: { photo_url: string; created_at: string } | null; error: unknown }

  if (!data) return NextResponse.json({ record: null })

  return NextResponse.json({
    record: { photoUrl: data.photo_url, createdAt: data.created_at },
  })
}
