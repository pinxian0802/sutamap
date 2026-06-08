'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDictionary } from '@/lib/i18n/context'
import { UserAvatar } from './UserAvatar'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

interface Props {
  userId: string
  currentUsername: string
  currentAvatarUrl: string | null
  onClose: () => void
}

export function EditProfileModal({ userId, currentUsername, currentAvatarUrl, onClose }: Props) {
  const router = useRouter()
  const dict = useDictionary()
  const [username, setUsername] = useState(currentUsername)
  const [avatarFile, setAvatarFile] = useState<Blob | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
    onClose()
    router.refresh()
  }

  const displayAvatarUrl = avatarPreview ?? currentAvatarUrl

  return (
    <Modal title={dict.profile.edit} onClose={onClose} minHeight="80vh" maxHeight="92vh">
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
    </Modal>
  )
}
