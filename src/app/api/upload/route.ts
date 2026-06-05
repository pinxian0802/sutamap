import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToR2 } from '@/lib/r2/client'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const type = formData.get('type') as string | null
    const buffer = Buffer.from(await file.arrayBuffer())

    let key: string
    if (type === 'avatar') {
      key = `avatars/${user.id}.webp`
    } else {
      const ext = file.type === 'image/jpeg' ? 'jpg' : 'webp'
      key = `checkins/${user.id}/${randomUUID()}.${ext}`
    }

    const url = await uploadToR2(key, buffer, file.type)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
