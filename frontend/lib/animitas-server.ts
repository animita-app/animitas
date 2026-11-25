import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { findAnimita } from '@/lib/animitas'

// Cached per request so the page and its metadata share one query.
export const getAnimita = cache(async (slug: string) => findAnimita(await createClient(), slug))
