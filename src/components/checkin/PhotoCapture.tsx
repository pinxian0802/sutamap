'use client'

import { useState } from 'react'
import { extractGpsFromPhoto, stripExifAndCompress } from '@/lib/geo/exif'
import { Button } from '@/components/ui/button'

interface Props {
  onReady: (file: Blob, gps: { lat: number; lng: number } | null) => void
}

export function PhotoCapture({ onReady }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
      setError('写真の処理に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <img src={preview} alt="preview" className="w-full rounded-xl object-cover max-h-64" />
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
          <span className="text-2xl">📷</span>
          <span className="text-sm text-gray-500 mt-2">写真を選択</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      )}
      {loading && <p className="text-sm text-gray-500 text-center">処理中...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {preview && (
        <label className="block text-sm text-blue-600 text-center cursor-pointer underline">
          写真を変更
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </label>
      )}
    </div>
  )
}
