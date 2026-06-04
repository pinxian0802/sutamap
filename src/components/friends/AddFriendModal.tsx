'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onClose: () => void
  myUserId: string
}

export function AddFriendModal({ onClose, myUserId }: Props) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'search' | 'qr'>('search')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

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
      setMessage('フレンド申請を送りました！')
      router.refresh()
    } else {
      setMessage(data.error ?? 'エラーが発生しました')
    }
  }

  return (
    <div className="fixed inset-0 z-[700] bg-black/40 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">フレンドを追加</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            検索
          </button>
          <button
            onClick={() => setTab('qr')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'qr' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            QRコード
          </button>
        </div>

        {tab === 'search' && (
          <div className="space-y-3">
            <Input
              placeholder="ユーザー名またはID"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            {message && <p className="text-sm text-center text-gray-600">{message}</p>}
            <Button className="w-full" onClick={handleSend} disabled={loading || !query.trim()}>
              {loading ? '送信中...' : '申請を送る'}
            </Button>
          </div>
        )}

        {tab === 'qr' && profileUrl && (
          <div className="flex flex-col items-center gap-3 p-4">
            <p className="text-sm text-gray-500">自分のQRコードを見せてスキャンしてもらう</p>
            <QRCodeSVG value={profileUrl} size={180} />
            <button
              onClick={() => navigator.clipboard.writeText(profileUrl)}
              className="text-sm text-blue-600 underline"
            >
              リンクをコピー
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
