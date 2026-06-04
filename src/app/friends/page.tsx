import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FriendsPageClient } from '@/components/friends/FriendsPageClient'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: friendships } = await (supabase as any)
    .from('friendships')
    .select('id, status, requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const friendIds = ((friendships ?? []) as any[])
    .filter((f: any) => f.status === 'accepted')
    .map((f: any) => f.requester_id === user.id ? f.addressee_id : f.requester_id)

  const { data: profiles } = friendIds.length > 0
    ? await supabase.from('user_profiles').select('id, username, level').in('id', friendIds) as any
    : { data: [] }

  const enriched = ((friendships ?? []) as any[]).map((f: any) => {
    const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id
    const profile = (profiles as any[])?.find((p: any) => p.id === friendId)
    return {
      friendshipId: f.id,
      userId: friendId,
      username: profile?.username ?? '不明',
      level: profile?.level ?? 1,
      status: f.status as 'pending' | 'accepted' | 'rejected',
      isRequester: f.requester_id === user.id,
    }
  }).filter((f: any) => f.status !== 'rejected')

  return <FriendsPageClient friendships={enriched} myUserId={user.id} />
}
