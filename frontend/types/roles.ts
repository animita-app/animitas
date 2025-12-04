export type UserRole = 'default' | 'paid' | 'editor'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export const ROLES: Record<string, UserRole> = {
  DEFAULT: 'default',
  PAID: 'paid',
  EDITOR: 'editor',
}
