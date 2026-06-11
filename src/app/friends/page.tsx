import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FriendsPageClient } from '@/components/friends/FriendsPageClient'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase.rpc('get_friends_with_stats') as any

  const friendships = ((data ?? []) as any[]).map((f: any) => ({
    friendshipId: f.friendship_id,
    userId: f.user_id,
    username: f.username ?? '?',
    level: f.level ?? 1,
    avatarUrl: f.avatar_url ?? null,
    status: f.status as 'pending' | 'accepted' | 'rejected',
    isRequester: f.is_requester,
    totalCheckins: Number(f.total_checkins ?? 0),
    rank: f.rank != null ? Number(f.rank) : null,
  }))

  return <FriendsPageClient friendships={friendships} myUserId={user.id} />
}
