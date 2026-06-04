'use client'

import { useState } from 'react'
import { LeaderboardTable } from './LeaderboardTable'
import { useDictionary } from '@/lib/i18n/context'

interface Entry {
  rank: number
  userId: string
  username: string
  level: number
  value: number
  isMe: boolean
}

interface Props {
  globalXp: Entry[]
  globalCheckins: Entry[]
  globalBadges: Entry[]
  friendsXp: Entry[]
  friendsCheckins: Entry[]
  friendsBadges: Entry[]
  isLoggedIn: boolean
}

type MetricTab = 'xp' | 'checkins' | 'badges'
type ScopeTab = 'global' | 'friends'

export function LeaderboardTabs(props: Props) {
  const [metric, setMetric] = useState<MetricTab>('xp')
  const [scope, setScope] = useState<ScopeTab>('global')
  const dict = useDictionary()

  const METRICS: { key: MetricTab; label: string; unit: string }[] = [
    { key: 'xp', label: 'XP', unit: 'XP' },
    { key: 'checkins', label: dict.leaderboard.checkins, unit: dict.leaderboard.timesUnit },
    { key: 'badges', label: dict.leaderboard.badges, unit: dict.leaderboard.countUnit },
  ]

  const dataMap: Record<ScopeTab, Record<MetricTab, Entry[]>> = {
    global: { xp: props.globalXp, checkins: props.globalCheckins, badges: props.globalBadges },
    friends: { xp: props.friendsXp, checkins: props.friendsCheckins, badges: props.friendsBadges },
  }

  const currentData = dataMap[scope][metric]
  const currentUnit = METRICS.find(m => m.key === metric)!.unit

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">{dict.leaderboard.title}</h1>

      <div className="flex gap-2">
        {(['global', 'friends'] as ScopeTab[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              scope === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {s === 'global' ? dict.leaderboard.global : dict.leaderboard.friendsTab}
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              metric === m.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!props.isLoggedIn && scope === 'friends' ? (
        <p className="text-center text-gray-400 text-sm py-8">{dict.leaderboard.loginForFriends}</p>
      ) : currentData.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">{dict.leaderboard.noData}</p>
      ) : (
        <LeaderboardTable entries={currentData} unit={currentUnit} />
      )}
    </div>
  )
}
