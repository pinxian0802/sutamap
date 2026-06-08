'use client'

import { useState } from 'react'
import { useDictionary } from '@/lib/i18n/context'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

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
  friendsXp: Entry[]
  friendsCheckins: Entry[]
  isLoggedIn: boolean
}

type MetricTab = 'xp' | 'checkins'
type ScopeTab = 'global' | 'friends'

const AVATAR_COLORS = ['#d8a24a', '#c0563f', '#8fa6bd', '#4f8db5', '#7aa83c', '#9a6bc0']
const medals = ['🥇', '🥈', '🥉']

export function LeaderboardTabs(props: Props) {
  const [metric, setMetric] = useState<MetricTab>('xp')
  const [scope, setScope] = useState<ScopeTab>('global')
  const dict = useDictionary()

  const METRICS: { key: MetricTab; label: string; unit: string }[] = [
    { key: 'xp', label: 'XP', unit: 'XP' },
    { key: 'checkins', label: dict.leaderboard.checkins, unit: dict.leaderboard.timesUnit },
  ]

  const dataMap: Record<ScopeTab, Record<MetricTab, Entry[]>> = {
    global: { xp: props.globalXp, checkins: props.globalCheckins },
    friends: { xp: props.friendsXp, checkins: props.friendsCheckins },
  }

  const currentData = dataMap[scope][metric]
  const currentUnit = METRICS.find(m => m.key === metric)!.unit

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>ランキング</h1>
      </div>

      {/* scope segmented */}
      <div className="mb-[11px]">
        <SegmentedControl
          options={[
            { id: 'global', label: dict.leaderboard.global },
            { id: 'friends', label: dict.leaderboard.friendsTab },
          ]}
          value={scope}
          onChange={(v) => setScope(v as ScopeTab)}
        />
      </div>

      {/* metric chips */}
      <div className="flex gap-2 overflow-x-auto mb-[14px] sm-noscroll">
        {METRICS.map(m => (
          <button
            key={m.key}
            className="sm-chip"
            onClick={() => setMetric(m.key)}
            style={metric === m.key ? { background: 'var(--green)', color: '#fff', borderColor: 'transparent' } : undefined}
          >
            {m.label}順
          </button>
        ))}
      </div>

      {!props.isLoggedIn && scope === 'friends' ? (
        <p className="text-center text-sub text-sm py-8">{dict.leaderboard.loginForFriends}</p>
      ) : currentData.length === 0 ? (
        <p className="text-center text-sub text-sm py-8">{dict.leaderboard.noData}</p>
      ) : (
        <>
          {/* podium top 3 */}
          {currentData.length >= 3 && (
            <div className="flex items-end gap-[9px] mb-4">
              {[1, 0, 2].map(idx => {
                const r = currentData[idx]
                if (!r) return null
                const h = idx === 0 ? 108 : 88
                const avatarSize = idx === 0 ? 52 : 44
                const avatarText = idx === 0 ? 22 : 18
                const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                return (
                  <div key={r.rank} className="flex-1 text-center">
                    <div
                      className="rounded-full mx-auto mb-[7px] text-white grid place-items-center font-bold border-2 border-white"
                      style={{
                        width: avatarSize, height: avatarSize, fontSize: avatarText,
                        background: color,
                        boxShadow: '0 6px 14px -6px rgba(45,74,107,.6)',
                      }}
                    >
                      {r.username[0]?.toUpperCase()}
                    </div>
                    <div className="text-[12.5px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{r.username}</div>
                    <div className="sm-mono text-[11px] text-sub">{r.value.toLocaleString()}</div>
                    <div
                      className="mt-[7px] rounded-t-[10px] grid place-items-center text-[24px] font-extrabold border border-line border-b-0"
                      style={{
                        height: h,
                        fontFamily: 'var(--font-display)',
                        background: idx === 0 ? 'linear-gradient(180deg,#f0d488,#d8a24a)' : 'var(--paper)',
                        color: idx === 0 ? '#fff' : 'var(--sub)',
                      }}
                    >
                      {medals[r.rank - 1]}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* full list */}
          <div className="sm-card" style={{ padding: 6 }}>
            {currentData.map((r, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <div
                  key={r.userId}
                  className="flex items-center gap-3 py-[11px] px-[10px] rounded-[11px] cursor-pointer"
                  style={{ background: r.isMe ? 'var(--tint)' : 'transparent' }}
                >
                  <span className="sm-mono w-[22px] text-center font-bold text-faint text-[14px]">
                    {r.rank <= 3 ? medals[r.rank - 1] : r.rank}
                  </span>
                  <span
                    className="w-[38px] h-[38px] rounded-full text-[16px] text-white grid place-items-center font-bold"
                    style={{ background: color }}
                  >
                    {r.username[0]?.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold">
                      {r.username}
                      {r.isMe && <span className="text-[11px] text-green-d ml-1.5">あなた</span>}
                    </div>
                    <div className="sm-mono text-[11px] text-sub">Lv {r.level}</div>
                  </div>
                  <span className="sm-mono text-[15px] font-bold">
                    {r.value.toLocaleString()}
                    <span className="text-[11px] text-sub ml-[3px]">{currentUnit}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
