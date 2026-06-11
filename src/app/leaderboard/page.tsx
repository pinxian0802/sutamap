import { createClient } from '@/lib/supabase/server'
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'

export default async function LeaderboardPage() {
  const dict = await getDictionary(await getLocale())
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase.rpc('get_leaderboard') as any
  const entries = (data ?? []) as any[]

  function buildRanking(list: any[], sortKey: 'total_xp' | 'total_checkins') {
    return [...list]
      .sort((a, b) => b[sortKey] - a[sortKey])
      .map((entry, i) => ({
        userId: entry.id,
        username: entry.username ?? dict.common.unknown,
        level: entry.level ?? 1,
        avatarUrl: entry.avatar_url ?? null,
        value: entry[sortKey],
        isMe: entry.id === user?.id,
        rank: i + 1,
      }))
  }

  const global = entries.slice(0, 50)
  const friends = entries.filter(e => e.is_friend)

  const globalXp       = buildRanking(global,  'total_xp').slice(0, 50)
  const globalCheckins = buildRanking(global,  'total_checkins').slice(0, 50)
  const friendsXp      = buildRanking(friends, 'total_xp')
  const friendsCheckins = buildRanking(friends, 'total_checkins')

  return (
    <LeaderboardTabs
      globalXp={globalXp}
      globalCheckins={globalCheckins}
      friendsXp={friendsXp}
      friendsCheckins={friendsCheckins}
      isLoggedIn={!!user}
    />
  )
}
