'use client'

interface Props {
  username: string
  avatarUrl?: string | null
  size?: number
  rounded?: 'full' | 'rounded'
  className?: string
}

export function UserAvatar({ username, avatarUrl, size = 48, rounded = 'full', className = '' }: Props) {
  const radius = rounded === 'full' ? '50%' : '14px'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    )
  }

  return (
    <span
      className={`grid place-items-center font-bold flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.42,
        background: 'linear-gradient(160deg, #aec1ce, #dde6ea)',
        color: 'var(--ink2)',
      }}
    >
      {username[0]?.toUpperCase() ?? '?'}
    </span>
  )
}
