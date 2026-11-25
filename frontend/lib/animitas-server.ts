import { createClient } from '@/lib/supabase/server'
import { findAnimita } from '@/lib/animitas'

export async function getAnimita(slug: string) {
  return findAnimita(await createClient(), slug)
}
