import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminPageClient } from '@/components/admin/AdminPageClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: categories }, { data: locations }] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: true }) as any,
    supabase.from('locations').select('*').order('created_at', { ascending: true }) as any,
  ])

  return (
    <AdminPageClient
      initialCategories={categories ?? []}
      initialLocations={locations ?? []}
    />
  )
}
