'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useDictionary } from '@/lib/i18n/context'
import { Search, Share2 } from 'lucide-react'
import { UserAvatar } from '@/components/profile/UserAvatar'

interface SearchUser {
  id: string
  username: string
  user_code: string
  avatar_url: string | null
  level: number
}

interface Props {
  onClose: () => void
  myUserId: string
}

export function AddFriendModal({ onClose, myUserId }: Props) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'search' | 'qr' | 'link'>('search')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchUser[] | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const dict = useDictionary()

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${myUserId}`
    : ''

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setResults(null)
    setMessage(null)
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
    const data = await res.json()
    setSearching(false)
    setResults(data.users ?? [])
  }

  async function handleSend(targetId: string) {
    setSending(targetId)
    setMessage(null)
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId }),
    })
    const data = await res.json()
    setSending(null)
    if (res.ok) {
      setSentIds(prev => new Set(prev).add(targetId))
      router.refresh()
    } else if (res.status === 409) {
      setMessage(dict.friends.alreadyExists)
    } else {
      setMessage(data.error ?? dict.friends.error)
    }
  }

  const methods = [
    { id: 'search' as const, label: dict.friends.methodUsername },
    { id: 'qr' as const, label: dict.friends.methodQr },
    { id: 'link' as const, label: dict.friends.methodLink },
  ]

  return (
    <div className="fixed inset-0 z-[700]">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(36,52,74,.34)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-paper rounded-t-[22px] transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ minHeight: '80vh', maxHeight: '92vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[38px] h-1 rounded-[2px]" style={{ background: '#d8d0bf' }} />
        </div>
        <div className="px-[18px] pt-2 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 60px)' }}>
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>{dict.friends.addFriend}</h3>
          <button className="sm-iconbtn" onClick={onClose}>
            <span className="text-[20px] leading-none text-sub">×</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-4 sm-noscroll">
          {methods.map(m => (
            <button
              key={m.id}
              className="sm-chip"
              onClick={() => setTab(m.id)}
              style={tab === m.id ? { background: 'var(--green)', color: '#fff', borderColor: 'transparent' } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>

        {tab === 'search' && (
          <>
            <div className="flex items-center gap-[9px] bg-paper2 border border-line rounded-[13px] py-3 px-[14px] mb-[14px]">
              <Search size={18} className="text-sub" />
              <input
                type="text"
                className="flex-1 border-none outline-none text-[14px] bg-transparent text-ink placeholder:text-sub"
                style={{ fontFamily: 'var(--font-sans)' }}
                placeholder={dict.friends.searchPlaceholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              className="sm-btn sm-btn-primary mb-[14px]"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              style={!query.trim() ? { opacity: 0.45 } : undefined}
            >
              {searching ? dict.friends.sending : dict.friends.search}
            </button>

            {message && <p className="text-sm text-center text-sub mb-3">{message}</p>}

            {results !== null && results.length === 0 && (
              <p className="text-sm text-center text-sub py-4">{dict.friends.noFriends}</p>
            )}

            {results && results.length > 0 && (
              <div className="space-y-[9px]">
                {results.map(u => (
                  <div key={u.id} className="sm-card flex items-center gap-3">
                    <UserAvatar username={u.username} avatarUrl={u.avatar_url} size={42} rounded="full" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-bold truncate">{u.username}</div>
                      <div className="sm-mono text-[11px] text-sub">#{u.user_code} · Lv {u.level}</div>
                    </div>
                    <button
                      className="sm-btn sm-btn-primary"
                      style={{ width: 'auto', padding: '6px 14px', fontSize: 13, flexShrink: 0, opacity: sentIds.has(u.id) ? 0.45 : 1 }}
                      disabled={sending === u.id || sentIds.has(u.id)}
                      onClick={() => handleSend(u.id)}
                    >
                      {sentIds.has(u.id) ? '✓' : sending === u.id ? '...' : dict.friends.sendRequest}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'qr' && profileUrl && (
          <div className="text-center">
            <div className="w-[178px] h-[178px] mx-auto mb-[14px] bg-white border border-line rounded-[18px] grid place-items-center">
              <QRCodeSVG value={profileUrl} size={138} />
            </div>
            <div className="sm-mono text-[13px] text-sub">@{myUserId.slice(0, 8)}</div>
          </div>
        )}

        {tab === 'link' && profileUrl && (
          <>
            <div className="flex items-center gap-[9px] bg-paper2 border border-line rounded-[13px] py-[13px] px-[14px] mb-[14px]">
              <span className="sm-mono flex-1 text-[12.5px] text-ink overflow-hidden whitespace-nowrap text-ellipsis">
                {profileUrl}
              </span>
              <Share2 size={17} className="text-green-d" />
            </div>
            <button
              className="sm-btn sm-btn-primary"
              onClick={() => navigator.clipboard.writeText(profileUrl)}
            >
              <Share2 size={18} strokeWidth={2} />
              {dict.friends.shareLink}
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  )
}
