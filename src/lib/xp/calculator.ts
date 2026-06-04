// Level formula: xp needed for level N = N*(N-1)*50
// Inverse: level = floor(0.5 + sqrt(0.25 + xp/50))
export function xpToLevel(xp: number): number {
  return Math.floor(0.5 + Math.sqrt(0.25 + xp / 50))
}

export function xpForLevel(level: number): number {
  return level * (level - 1) * 50
}

export function xpToNextLevel(xp: number): { current: number; needed: number; level: number } {
  const level = xpToLevel(xp)
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  return {
    current: xp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
    level,
  }
}
