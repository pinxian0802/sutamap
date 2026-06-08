'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDictionary } from '@/lib/i18n/context'
import { UserAvatar } from './UserAvatar'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface Props {
  userId: string
  currentUsername: string
  currentAvatarUrl: string | null
  onClose: () => void
}

export function EditProfileModal({ userId, currentUsername, currentAvatarUrl, onClose }: Props) {
  const router = useRouter()
  const dict = useDictionary()
  const [visible, setVisible] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [avatarFile, setAvatarFile] = useState<Blob | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const { default: imageCompression } = await import('browser-image-compression')
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 512,
      useWebWorker: true,
      fileType: 'image/webp',
    })

    setAvatarFile(compressed)
    setAvatarPreview(URL.createObjectURL(compressed))
  }

  async function handleSave() {
    if (username.length > 20) {
      toast.error(dict.profile.usernameTooLong)
      return
    }

    setSaving(true)

    let newAvatarUrl = currentAvatarUrl

    if (avatarFile) {
      const formData = new FormData()
      formData.append('file', avatarFile, 'avatar.webp')
      formData.append('type', 'avatar')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        toast.error(dict.profile.uploadFailed)
        setSaving(false)
        return
      }
      const { url } = await res.json()
      newAvatarUrl = url
    }

    const supabase = createClient()
    const { error } = await (supabase as any)
      .from('user_profiles')
      .update({ username, avatar_url: newAvatarUrl })
      .eq('id', userId)

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success(dict.profile.saveSuccess)
    setSaving(false)
    handleClose()
    router.refresh()
  }

  const displayAvatarUrl = avatarPreview ?? currentAvatarUrl

  return (
    <div className="fixed inset-0 z-[700]">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(36,52,74,.34)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-paper rounded-t-[22px] transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ minHeight: '60vh', maxHeight: '92vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[38px] h-1 rounded-[2px]" style={{ background: '#d8d0bf' }} />
        </div>

        <div className="flex items-center justify-between px-[18px] pt-2 pb-4">
          <h2 className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {dict.profile.edit}
          </h2>
          <button className="sm-iconbtn" onClick={handleClose}>
            <X size={18} className="text-sub" />
          </button>
        </div>

        <div className="px-[18px] pb-12 space-y-5">
          <div className="flex flex-col items-center gap-2">
            <UserAvatar
              username={username}
              avatarUrl={displayAvatarUrl}
              size={80}
              rounded="full"
            />
            <label className="text-[13px] font-semibold cursor-pointer" style={{ color: 'var(--green-d)' }}>
              {dict.profile.changeAvatar}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={saving}
              />
            </label>
          </div>

          <div>
            <label className="text-[12px] text-sub font-bold block mb-[6px]">
              {dict.profile.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-[10px] rounded-[10px] text-[14px] bg-paper2 border border-line focus:outline-none focus:border-green"
            />
            <div className="text-right text-[11px] text-sub mt-1">{username.length}/20</div>
          </div>

          <button
            className="sm-btn sm-btn-primary"
            onClick={handleSave}
            disabled={saving || !username.trim()}
            style={(saving || !username.trim()) ? { opacity: 0.45 } : undefined}
          >
            {saving ? dict.profile.saving : dict.profile.save}
          </button>
        </div>
      </div>
    </div>
  )
}
