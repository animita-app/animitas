import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import sql from '../lib/neon'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'sms',
      name: 'SMS OTP',
      credentials: {
        phone: { label: 'Teléfono', type: 'text' },
        code: { label: 'Código', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          throw new Error('Invalid SMS credentials')
        }

        const verificationCodes = await sql`SELECT * FROM "VerificationCode" WHERE phone = ${credentials.phone as string} AND code = ${credentials.code as string} AND "expiresAt" > NOW() LIMIT 1`
        const verificationCode = verificationCodes[0]

        if (!verificationCode) {
          throw new Error('Invalid or expired code')
        }

        const users = await sql`SELECT * FROM "User" WHERE phone = ${credentials.phone as string} LIMIT 1`
        const user = users[0]

        if (!user) {
          throw new Error('User not found')
        }

        await sql`DELETE FROM "VerificationCode" WHERE id = ${verificationCode.id}`

        return {
          id: user.id,
          email: user.email || '',
          username: user.username || '',
          name: user.displayName || user.username || '',
          image: user.image,
        } as any
      },
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const users = await sql`SELECT * FROM "User" WHERE email = ${credentials.email as string} LIMIT 1`
        const user = users[0]

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email || '',
          username: user.username || '',
          name: user.displayName || user.username || '',
          image: user.image,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
})
