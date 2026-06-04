import { createClient } from '@/lib/supabase/server'
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'

export default async function LeaderboardPage() {
  const dict = await getDictionary(await getLocale())
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: xpRanking } = await supabase
    .from('user_profiles')
    .select('id, username, total_xp, level')
    .order('total_xp', { ascending: false })
    .limit(50) as { data: { id: string; username: string; total_xp: number; level: number }[] | null; error: unknown }

  const { data: checkinCounts } = await (supabase as any)
    .from('checkins')
    .select('user_id')
    .eq('is_first', true)

  const checkinCountMap: Record<string, number> = {}
  ;((checkinCounts ?? []) as any[]).forEach((c: any) => {
    checkinCountMap[c.user_id] = (checkinCountMap[c.user_id] ?? 0) + 1
  })

  const { data: badgeCounts } = await (supabase as any)
    .from('user_badges')
    .select('user_id')

  const badgeCountMap: Record<string, number> = {}
  ;((badgeCounts ?? []) as any[]).forEach((b: any) => {
    badgeCountMap[b.user_id] = (badgeCountMap[b.user_id] ?? 0) + 1
  })

  let friendIds: string[] = []
  if (user) {
    const { data: friendships } = await (supabase as any)
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')
    friendIds = [
      ...((friendships ?? []) as any[]).map((f: any) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      ),
      user.id,
    ]
  }

  const profileMap = Object.fromEntries((xpRanking ?? []).map(p => [p.id, p]))

  function buildRanking(userIds: string[], getValue: (id: string) => number) {
    return userIds
      .map(id => ({
        userId: id,
        username: profileMap[id]?.username ?? dict.common.unknown,
        level: profileMap[id]?.level ?? 1,
        value: getValue(id),
        isMe: id === user?.id,
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, i) => ({ ...entry, rank: i + 1 }))
  }

  const allIds = (xpRanking ?? []).map(p => p.id)

  const globalXp = buildRanking(allIds, id => profileMap[id]?.total_xp ?? 0)
  const globalCheckins = buildRanking(allIds, id => checkinCountMap[id] ?? 0)
  const globalBadges = buildRanking(allIds, id => badgeCountMap[id] ?? 0)

  const friendsXp = buildRanking(friendIds, id => profileMap[id]?.total_xp ?? 0)
  const friendsCheckins = buildRanking(friendIds, id => checkinCountMap[id] ?? 0)
  const friendsBadges = buildRanking(friendIds, id => badgeCountMap[id] ?? 0)

  return (
    <LeaderboardTabs
      globalXp={globalXp}
      globalCheckins={globalCheckins}
      globalBadges={globalBadges}
      friendsXp={friendsXp}
      friendsCheckins={friendsCheckins}
      friendsBadges={friendsBadges}
      isLoggedIn={!!user}
    />
  )
}
