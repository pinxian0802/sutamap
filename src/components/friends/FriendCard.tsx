'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/lib/i18n/context'

interface Props {
  friendshipId: string
  userId: string
  username: string
  level: number
  status: 'pending' | 'accepted' | 'rejected'
  isRequester: boolean
}

export function FriendCard({ friendshipId, userId, username, level, status, isRequester }: Props) {
  const router = useRouter()
  const dict = useDictionary()

  async function handleAccept() {
    await fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    router.refresh()
  }

  async function handleReject() {
    await fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    })
    router.refresh()
  }

  async function handleRemove() {
    await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Link href={`/profile/${userId}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
          {username[0].toUpperCase()}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${userId}`} className="font-semibold text-sm hover:text-blue-600">
          {username}
        </Link>
        <p className="text-xs text-gray-400">Lv {level}</p>
      </div>
      <div className="flex gap-2">
        {status === 'pending' && !isRequester && (
          <>
            <button onClick={handleAccept} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">{dict.friends.accept}</button>
            <button onClick={handleReject} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{dict.friends.reject}</button>
          </>
        )}
        {status === 'pending' && isRequester && (
          <span className="text-xs text-gray-400 px-2">{dict.friends.pending}</span>
        )}
        {status === 'accepted' && (
          <button onClick={handleRemove} className="text-xs text-red-400 px-2">{dict.friends.remove}</button>
        )}
      </div>
    </div>
  )
}
