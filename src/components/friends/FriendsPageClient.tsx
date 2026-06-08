'use client'

import { useState } from 'react'
import { FriendCard } from './FriendCard'
import { AddFriendModal } from './AddFriendModal'
import { useDictionary } from '@/lib/i18n/context'
import { Plus } from 'lucide-react'

interface FriendItem {
  friendshipId: string
  userId: string
  username: string
  level: number
  avatarUrl?: string | null
  status: 'pending' | 'accepted' | 'rejected'
  isRequester: boolean
}

interface Props {
  friendships: FriendItem[]
  myUserId: string
}

const FRIEND_COLORS = ['#c0563f', '#4f8db5', '#d8a24a', '#7aa83c', '#9a6bc0']

export function FriendsPageClient({ friendships, myUserId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [items, setItems] = useState(friendships)
  const dict = useDictionary()

  const accepted = items.filter(f => f.status === 'accepted')
  const pending = items.filter(f => f.status === 'pending')

  function handleAccept(friendshipId: string) {
    const prev = items
    setItems(items.map(f => f.friendshipId === friendshipId ? { ...f, status: 'accepted' as const } : f))
    fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    }).then(r => { if (!r.ok) setItems(prev) })
  }

  function handleReject(friendshipId: string) {
    const prev = items
    setItems(items.filter(f => f.friendshipId !== friendshipId))
    fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    }).then(r => { if (!r.ok) setItems(prev) })
  }

  function handleRemove(friendshipId: string) {
    const prev = items
    setItems(items.filter(f => f.friendshipId !== friendshipId))
    fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' })
      .then(r => { if (!r.ok) setItems(prev) })
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-4 space-y-[13px]">
      <div className="flex items-center justify-between px-[2px] pt-[6px] pb-[14px]">
        <h1 className="text-[19px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.friends.title}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="sm-iconbtn"
          style={{ background: 'var(--green)', border: 'none', color: '#fff', boxShadow: '0 6px 14px -6px rgba(122,168,60,.8)' }}
        >
          <Plus size={20} strokeWidth={2.4} />
        </button>
      </div>

      {pending.length > 0 && (
        <>
          <div className="sm-sectit"><span>{dict.friends.requestCount} {pending.length}</span></div>
          {pending.map((f, i) => (
            <FriendCard
              key={f.friendshipId}
              {...f}
              color={FRIEND_COLORS[i % FRIEND_COLORS.length]}
              onAccept={handleAccept}
              onReject={handleReject}
              onRemove={handleRemove}
            />
          ))}
        </>
      )}

      <div className="sm-sectit">
        <span>{dict.friends.title} {accepted.length}</span>
        <span className="normal-case tracking-normal text-faint">{dict.friends.progressCompare}</span>
      </div>
      {accepted.length === 0 ? (
        <p className="text-sm text-sub text-center py-4">{dict.friends.noFriends}</p>
      ) : (
        accepted.map((f, i) => (
          <FriendCard
            key={f.friendshipId}
            {...f}
            color={FRIEND_COLORS[i % FRIEND_COLORS.length]}
            onAccept={handleAccept}
            onReject={handleReject}
            onRemove={handleRemove}
          />
        ))
      )}

      {showModal && <AddFriendModal onClose={() => setShowModal(false)} myUserId={myUserId} />}
    </div>
  )
}
