import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 1) return NextResponse.json({ users: [] })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const upperQ = q.toUpperCase()
  const { data } = await supabase
    .from('user_profiles')
    .select('id, username, user_code, avatar_url, level')
    .or(`user_code.eq.${upperQ},username.ilike.%${q}%`)
    .neq('id', user.id)
    .limit(10) as any

  return NextResponse.json({ users: data ?? [] })
}
