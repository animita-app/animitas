
import { User, ROLES } from '@/types/roles'

export const USERS: User[] = [
  { id: 'u1', name: 'Visitante (Default)', email: 'user@animita.cl', role: ROLES.DEFAULT },
  { id: 'u2', name: 'Editor', email: 'editor@animita.cl', role: ROLES.EDITOR, avatarUrl: 'https://github.com/shadcn.png' },
  { id: 'u3', name: 'Superadmin', email: 'admin@animita.cl', role: ROLES.SUPERADMIN },
]

export const CURRENT_USER: User = USERS[0] // Default user
