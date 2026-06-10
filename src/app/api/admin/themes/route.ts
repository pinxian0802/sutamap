import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: themes, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: true }) as any

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(themes)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('themes')
    .insert({
      theme_id: body.theme_id,
      name: body.name,
      name_en: body.name_en,
      name_zh: body.name_zh,
      description: body.description || null,
      color: body.color,
      icon: body.icon,
      checkin_radius_meters: body.checkin_radius_meters,
      xp_per_checkin: body.xp_per_checkin,
    } as any)
    .select()
    .single() as any

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
