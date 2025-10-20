import { getSession } from 'next-auth/react'
import type { Session } from 'next-auth'

const ADMIN_USERNAMES = ['icarus', 'admin']

export async function isAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user?.username) return false
  return ADMIN_USERNAMES.includes(session.user.username.toLowerCase())
}

export async function getAdminSession(): Promise<Session | null> {
  const session = await getSession()
  if (!session) return null

  const admin = await isAdmin(session)
  return admin ? session : null
}

export function canAccessAdmin(username?: string | null): boolean {
  if (!username) return false
  return ADMIN_USERNAMES.includes(username.toLowerCase())
}
