'use client'

import { useState } from 'react'
import { extractGpsFromPhoto, stripExifAndCompress } from '@/lib/geo/exif'
import { useDictionary } from '@/lib/i18n/context'
import { Camera, Check } from 'lucide-react'

interface Props {
  onReady: (file: Blob, gps: { lat: number; lng: number } | null) => void
}

export function PhotoCapture({ onReady }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const dict = useDictionary()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const gps = await extractGpsFromPhoto(file)
      const stripped = await stripExifAndCompress(file)
      const url = URL.createObjectURL(stripped)
      setPreview(url)
      onReady(stripped, gps)
    } catch {
      setError(dict.photo.processFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <label className="block cursor-pointer">
          <div
            className="h-[172px] rounded-[16px] overflow-hidden grid place-items-center"
            style={{ background: 'repeating-linear-gradient(135deg,#dfe7d3 0 12px,#d6e0c8 12px 24px)' }}
          >
            <div className="text-center" style={{ color: '#5e7038' }}>
              <Check size={30} strokeWidth={2.4} className="text-green mx-auto" />
              <div className="sm-mono text-[12.5px] mt-1.5 font-bold">{dict.checkin.photoAttached}</div>
            </div>
          </div>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </label>
      ) : (
        <label className="block cursor-pointer">
          <div
            className="h-[172px] rounded-[16px] grid place-items-center"
            style={{ border: '2px dashed #c7cdbb', background: 'var(--paper2)' }}
          >
            <div className="text-center text-sub">
              <Camera size={34} strokeWidth={1.7} className="mx-auto" />
              <div className="text-[13px] mt-2 font-bold">{dict.photo.select}</div>
              <div className="sm-mono text-[10.5px] mt-[3px]">{dict.checkin.exifGps}</div>
            </div>
          </div>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </label>
      )}
      {loading && <p className="text-sm text-sub text-center">{dict.photo.processing}</p>}
      {error && <p className="text-sm text-terra">{error}</p>}
    </div>
  )
}
