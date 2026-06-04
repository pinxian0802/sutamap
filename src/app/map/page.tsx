import { createClient } from '@/lib/supabase/server'
import { MapView } from '@/components/map/MapView'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: locations }, { data: categories }] = await Promise.all([
    supabase.from('locations').select('*, categories(id, name, color, icon)').eq('is_active', true),
    supabase.from('categories').select('*'),
  ])

  let userCheckinLocationIds: string[] = []
  if (user) {
    const { data: checkins } = await supabase
      .from('checkins')
      .select('location_id')
      .eq('user_id', user.id)
      .eq('is_first', true)
    userCheckinLocationIds = checkins?.map(c => c.location_id) ?? []
  }

  return (
    <MapView
      locations={locations ?? []}
      categories={categories ?? []}
      userCheckinLocationIds={userCheckinLocationIds}
      isLoggedIn={!!user}
    />
  )
}
