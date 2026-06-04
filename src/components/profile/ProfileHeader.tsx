import { Progress } from '@/components/ui/progress'
import { xpToNextLevel } from '@/lib/xp/calculator'

interface Props {
  username: string
  totalXp: number
  level: number
  activeTitle?: string | null
}

export function ProfileHeader({ username, totalXp, level, activeTitle }: Props) {
  const { current, needed } = xpToNextLevel(totalXp)
  const pct = Math.round((current / needed) * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {username[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold">{username}</h1>
          {activeTitle && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {activeTitle}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-gray-700">Lv {level}</span>
          <span className="text-gray-400 text-xs">{current} / {needed} XP</span>
        </div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-gray-400 text-right">Total: {totalXp} XP</p>
      </div>
    </div>
  )
}
