import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const themeId = request.nextUrl.searchParams.get('theme_id')

  let query = supabase.from('locations').select('*').order('created_at', { ascending: true })
  if (themeId) {
    query = query.eq('theme_id', themeId)
  }

  const { data, error } = await query as any

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('locations')
    .insert({
      theme_id: body.theme_id,
      name: body.name,
      name_en: body.name_en || null,
      name_zh: body.name_zh || null,
      prefecture: body.prefecture || null,
      lat: body.lat,
      lng: body.lng,
      is_active: body.is_active ?? true,
    } as any)
    .select()
    .single() as any

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
