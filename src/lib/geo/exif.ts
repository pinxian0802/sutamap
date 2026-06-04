import exifr from 'exifr'

export interface GpsCoords {
  lat: number
  lng: number
}

export async function extractGpsFromPhoto(file: File): Promise<GpsCoords | null> {
  try {
    const result = await exifr.gps(file)
    if (!result?.latitude || !result?.longitude) return null
    return { lat: result.latitude, lng: result.longitude }
  } catch {
    return null
  }
}

export async function stripExifAndCompress(file: File): Promise<Blob> {
  const { default: imageCompression } = await import('browser-image-compression')
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
  return compressed
}
