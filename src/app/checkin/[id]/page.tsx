import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckinFlow } from '@/components/checkin/CheckinFlow'

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: location } = await supabase
    .from('locations')
    .select('*, categories(*)')
    .eq('id', id)
    .single()

  if (!location) notFound()

  let alreadyCheckedIn = false
  if (user) {
    const { data } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('location_id', id)
      .eq('is_first', true)
      .maybeSingle()
    alreadyCheckedIn = !!data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: location.categories.color }}>
            {location.categories.name}
          </p>
          <h1 className="text-2xl font-bold">{location.name}</h1>
          {location.prefecture && <p className="text-sm text-gray-500">{location.prefecture}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <CheckinFlow
            location={location}
            isLoggedIn={!!user}
            alreadyCheckedIn={alreadyCheckedIn}
          />
        </div>
      </div>
    </div>
  )
}
