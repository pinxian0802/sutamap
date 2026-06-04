'use client'

import { useState } from 'react'
import { FriendCard } from './FriendCard'
import { AddFriendModal } from './AddFriendModal'
import { Button } from '@/components/ui/button'
import { useDictionary } from '@/lib/i18n/context'

interface FriendItem {
  friendshipId: string
  userId: string
  username: string
  level: number
  status: 'pending' | 'accepted' | 'rejected'
  isRequester: boolean
}

interface Props {
  friendships: FriendItem[]
  myUserId: string
}

export function FriendsPageClient({ friendships, myUserId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const dict = useDictionary()

  const accepted = friendships.filter(f => f.status === 'accepted')
  const pending = friendships.filter(f => f.status === 'pending')

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{dict.friends.title}</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>{dict.friends.add}</Button>
      </div>

      {pending.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-blue-600 mb-2">{dict.friends.requests} ({pending.length})</h2>
          <div className="divide-y divide-blue-100">
            {pending.map(f => <FriendCard key={f.friendshipId} {...f} />)}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">{dict.friends.title} ({accepted.length})</h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{dict.friends.noFriends}</p>
        ) : (
          <div className="divide-y">
            {accepted.map(f => <FriendCard key={f.friendshipId} {...f} />)}
          </div>
        )}
      </div>

      {showModal && <AddFriendModal onClose={() => setShowModal(false)} myUserId={myUserId} />}
    </div>
  )
}
