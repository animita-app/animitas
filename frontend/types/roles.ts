export type UserRole = 'free' | 'pro' | 'institutional' | 'editor'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export const ROLES: Record<string, UserRole> = {
  FREE: 'free',
  PRO: 'pro',
  INSTITUTIONAL: 'institutional',
  EDITOR: 'editor',
}
