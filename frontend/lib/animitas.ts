import type { SupabaseClient } from '@supabase/supabase-js'
import type { Animita } from '@/types/animita'
import { normalizeLocation } from '@/lib/location'

// The tables keep the names from when the project covered every kind of heritage site.
export const TABLES = {
  animitas: 'heritage_sites',
  velas: 'heritage_site_reactions',
  comments: 'heritage_site_comments',
  profiles: 'user_profiles',
} as const

export function toAnimita(row: any): Animita | null {
  const location = normalizeLocation(row.location) ?? normalizeLocation(row)
  if (!location) return null
  return {
    ...row,
    location,
    created_by: {
      id: row.user_profiles?.id || row.creator_id || '',
      name: row.user_profiles?.display_name || 'Anónimo',
    },
  }
}

export async function listAnimitas(supabase: SupabaseClient): Promise<Animita[]> {
  const { data, error } = await supabase.from(TABLES.animitas).select('*').eq('status', 'published')
  if (error) throw error
  return (data ?? []).map(toAnimita).filter((a): a is Animita => a !== null)
}

export async function findAnimita(supabase: SupabaseClient, slug: string): Promise<Animita | null> {
  const { data } = await supabase
    .from(TABLES.animitas)
    .select('*, user_profiles!creator_id(id, display_name)')
    .eq('slug', slug)
    .maybeSingle()
  return data ? toAnimita(data) : null
}
