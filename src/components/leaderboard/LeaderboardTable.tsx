'use client'

import Link from 'next/link'

interface Entry {
  rank: number
  userId: string
  username: string
  level: number
  value: number
  isMe: boolean
}

interface Props {
  entries: Entry[]
  unit: string
}

export function LeaderboardTable({ entries, unit }: Props) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-1">
      {entries.map(entry => (
        <Link
          key={entry.userId}
          href={`/profile/${entry.userId}`}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            entry.isMe ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <span className="w-7 text-center text-sm font-bold text-gray-400">
            {entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}
          </span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {entry.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{entry.username}</p>
            <p className="text-xs text-gray-400">Lv {entry.level}</p>
          </div>
          <span className="text-sm font-bold text-gray-700">
            {entry.value.toLocaleString()} <span className="text-xs text-gray-400">{unit}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
