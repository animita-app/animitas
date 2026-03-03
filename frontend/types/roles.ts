export type UserRole = 'default' | 'editor' | 'superadmin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  username?: string
  avatarUrl?: string
}

export const ROLES: Record<string, UserRole> = {
  DEFAULT: 'default',
  EDITOR: 'editor',
  SUPERADMIN: 'superadmin',
}
