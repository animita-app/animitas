import { Session } from 'next-auth'
import { apiFetch } from './api'

export interface UserProfile {
  id: string
  phone: string | null
  username: string | null
  displayName: string | null
  email: string | null
  profilePicture: string | null
  role: 'FREE' | 'PREMIUM' | 'ADMIN'
  phoneVerified: string | null
  emailVerified: string | null
  createdAt: string
  updatedAt: string
}

export function getUserFromSession(session: Session | null): UserProfile | null {
  if (!session?.user) return null

  return {
    id: (session.user as any).id || '',
    phone: (session.user as any).phone || null,
    username: (session.user as any).username || null,
    displayName: (session.user as any).displayName || null,
    email: session.user.email || null,
    profilePicture: session.user.image || (session.user as any).profilePicture || null,
    role: (session as any).role || 'FREE',
    phoneVerified: (session.user as any).phoneVerified || null,
    emailVerified: session.user.emailVerified || null,
    createdAt: (session.user as any).createdAt || new Date().toISOString(),
    updatedAt: (session.user as any).updatedAt || new Date().toISOString()
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  return apiFetch(`/users/${userId}`)
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiFetch('/profile')
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Failed to update profile')
  }

  return response.json()
}

export async function updateUserRole(userId: string, role: string): Promise<UserProfile> {
  const response = await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      data: { role }
    })
  })

  if (!response.ok) {
    throw new Error('Failed to update user role')
  }

  return response.json()
}

export function isAdmin(session: Session | null): boolean {
  return (session as any)?.role === 'ADMIN'
}

export function isPremium(session: Session | null): boolean {
  const role = (session as any)?.role
  return role === 'PREMIUM' || role === 'ADMIN'
}

export function canModerate(session: Session | null): boolean {
  return isAdmin(session)
}

export function getUserDisplayName(user: UserProfile | null): string {
  if (!user) return 'Anonymous'
  return user.displayName || user.username || 'User'
}

export function getUserInitials(user: UserProfile | null): string {
  if (!user) return '?'
  const name = user.displayName || user.username || '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getUserAvatarUrl(user: UserProfile | null): string | null {
  if (!user) return null
  return user.profilePicture || null
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
  if (!query || query.length < 2) return []

  try {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

export function formatUserHandle(username: string | null): string {
  if (!username) return ''
  return `@${username}`
}

export function compareUsers(user1: UserProfile | null, user2: UserProfile | null): boolean {
  if (!user1 || !user2) return false
  return user1.id === user2.id
}
