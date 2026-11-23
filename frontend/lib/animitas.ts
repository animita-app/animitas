import { createClient } from '@/lib/supabase/server'
import { normalizeLocation } from '@/lib/location'

export async function getAnimita(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('heritage_sites')
    .select('*, user_profiles!creator_id(id, display_name)')
    .eq('slug', slug)
    .single()

  if (!data) return null

  return {
    ...data,
    location: normalizeLocation(data.location) ?? normalizeLocation(data),
    created_by: {
      id: data.user_profiles?.id || data.creator_id || '',
      name: data.user_profiles?.display_name || 'Anónimo',
    },
  }
}
