interface Badge {
  id: string
  name: string
  description: string | null
  icon: string
}

interface Props {
  earnedBadges: Badge[]
  allBadges: Badge[]
}

export function BadgeWall({ earnedBadges, allBadges }: Props) {
  const earnedIds = new Set(earnedBadges.map(b => b.id))

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">バッジ</h2>
      <div className="grid grid-cols-4 gap-3">
        {allBadges.map(badge => {
          const earned = earnedIds.has(badge.id)
          return (
            <div
              key={badge.id}
              title={badge.name}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
                earned ? 'bg-blue-50' : 'bg-gray-50 opacity-40'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs text-center text-gray-600 leading-tight line-clamp-2">
                {badge.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
