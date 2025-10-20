import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      phone?: string | null
      role?: string
    }
  }

  interface User {
    id: string
    phone?: string | null
    displayName?: string | null
    email?: string | null
    image?: string | null
    role?: string
    username?: string | null
  }
}
