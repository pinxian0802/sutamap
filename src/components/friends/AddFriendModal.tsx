'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useDictionary } from '@/lib/i18n/context'
import { Search, Share2 } from 'lucide-react'

interface Props {
  onClose: () => void
  myUserId: string
}

export function AddFriendModal({ onClose, myUserId }: Props) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'search' | 'id' | 'qr' | 'link'>('search')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const dict = useDictionary()

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${myUserId}`
    : ''

  async function handleSend() {
    if (!query.trim()) return
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUsername: query.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setMessage(dict.friends.requestSent)
      router.refresh()
    } else {
      setMessage(data.error ?? dict.friends.error)
    }
  }

  const methods = [
    { id: 'search' as const, label: dict.friends.methodUsername },
    { id: 'id' as const, label: dict.friends.methodId },
    { id: 'qr' as const, label: dict.friends.methodQr },
    { id: 'link' as const, label: dict.friends.methodLink },
  ]

  return (
    <div className="sm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sm-sheet">
        <div className="w-[38px] h-1 rounded-[2px] bg-[#d8d0bf] mx-auto mt-1 mb-[14px]" />
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

        {(tab === 'search' || tab === 'id') && (
          <>
            <div className="flex items-center gap-[9px] bg-paper2 border border-line rounded-[13px] py-3 px-[14px] mb-[14px]">
              <Search size={18} className="text-sub" />
              <input
                type="text"
                className="flex-1 border-none outline-none text-[14px] bg-transparent text-ink placeholder:text-sub"
                style={{ fontFamily: 'var(--font-sans)' }}
                placeholder={tab === 'search' ? dict.friends.searchUsername : dict.friends.searchId}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
            </div>
            {message && <p className="text-sm text-center text-sub mb-3">{message}</p>}
            <button
              className="sm-btn sm-btn-primary"
              onClick={handleSend}
              disabled={loading || !query.trim()}
              style={!query.trim() ? { opacity: 0.45 } : undefined}
            >
              {loading ? dict.friends.sending : dict.friends.sendRequest}
            </button>
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
  )
}
