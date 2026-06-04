import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: friendships } = await (supabase as any)
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  return NextResponse.json({ friendships: friendships ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetId, targetUsername } = await request.json()

  let addresseeId = targetId
  if (!addresseeId && targetUsername) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', targetUsername)
      .maybeSingle() as { data: { id: string } | null; error: unknown }
    addresseeId = profile?.id
  }

  if (!addresseeId) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (addresseeId === user.id) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 })

  const { error } = await (supabase as any)
    .from('friendships')
    .insert({ requester_id: user.id, addressee_id: addresseeId, status: 'pending' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
