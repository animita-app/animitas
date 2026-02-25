import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types/roles'

/**
 * Server-side auth guard utilities.
 * Use in Server Components, Server Actions, and Route Handlers.
 */

/** Returns the authenticated user or redirects to /login */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth')
  }

  return user
}

/** Returns the user's profile (with role) or redirects */
export async function requireProfile() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth')
  }

  return { user, profile }
}

/** Require a minimum role level. Redirects to / if not authorized. */
export async function requireRole(minRole: 'editor' | 'superadmin') {
  const { user, profile } = await requireProfile()

  const ROLE_HIERARCHY: Record<string, number> = {
    default: 0,
    editor: 1,
    superadmin: 2,
  }

  const userLevel = ROLE_HIERARCHY[profile.role] ?? 0
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0

  if (userLevel < requiredLevel) {
    redirect('/')
  }

  return { user, profile }
}

/** Check if user is creator of a heritage site OR has a minimum role */
export async function requireCreatorOrRole(siteId: string, minRole: 'editor' | 'superadmin' = 'editor') {
  const { user, profile } = await requireProfile()

  const ROLE_HIERARCHY: Record<string, number> = {
    default: 0,
    editor: 1,
    superadmin: 2,
  }

  const userLevel = ROLE_HIERARCHY[profile.role] ?? 0
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0

  // If user has the required role, allow regardless of ownership
  if (userLevel >= requiredLevel) {
    return { user, profile, isCreator: false }
  }

  // Otherwise check if user is the creator
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('heritage_sites')
    .select('creator_id')
    .eq('id', siteId)
    .single()

  if (!site || site.creator_id !== user.id) {
    redirect('/')
  }

  return { user, profile, isCreator: true }
}

/**
 * Non-redirecting version: returns null instead of redirecting.
 * Useful for conditional UI rendering in Server Components.
 */
export async function getAuthProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return { user, profile }
}
