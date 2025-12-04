import { UserRole, ROLES } from '@/types/roles'

export const CURRENT_USER = {
  id: '1',
  name: 'Pype',
  email: 'pype@animita.app',
  role: ROLES.EDITOR as UserRole, // Change this to ROLES.PAID or ROLES.EDITOR to test other roles
  avatarUrl: '/pype.png'
}

export const FAKE_USERS: Record<string, { username: string; avatar: string }> = {
  'user-1': { username: '@pbenavides', avatar: '/pbenavides.jpg' },
  'user-2': { username: '@vicpino', avatar: '/vicpino.png' },
  'user-3': { username: '@mlarrain', avatar: '/mlarrain.png' },
  'user-4': { username: '@jkarich', avatar: '/jkarich.jpeg' },
  'user-5': { username: '@fmoure', avatar: '/fmoure.jpeg' },
  'user-6': { username: '@lvalenzuela', avatar: '/lvalenzuela.png' },
  'user-7': { username: '@tfolch', avatar: '/tfolch.png' },
  'user-8': { username: '@svalenzuela', avatar: '/svalenzuela.jpg' },
  'current-user': { username: '@pype', avatar: '/pype.png' },
}

export const USERS = ['user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8', 'user-9'];
