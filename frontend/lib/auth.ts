import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },

  providers: [
    CredentialsProvider({
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null
        }

        try {
          const verificationCode = await prisma.verificationCode.findFirst({
            where: {
              phone: credentials.phone,
              code: credentials.code,
              expiresAt: {
                gt: new Date(),
              },
            },
          })

          if (!verificationCode) {
            return null
          }

          await prisma.verificationCode.update({
            where: { id: verificationCode.id },
            data: { verified: true },
          })

          let user = await prisma.user.findUnique({
            where: { phone: credentials.phone },
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                phone: credentials.phone,
                phoneVerified: new Date(),
              },
            })
          } else if (!user.phoneVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { phoneVerified: new Date() },
            })
          }

          return {
            id: user.id,
            phone: user.phone,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            image: user.profilePicture,
          }
        } catch (error) {
          console.error('Phone auth error:', error)
          return null
        }
      },
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
          image: user.image || user.profilePicture,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - user:', user)
      if (user) {
        token.sub = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.displayName = (user as any).displayName
        token.username = (user as any).username
      }
      console.log('JWT callback - token:', token)
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - token.sub:', token.sub)
      if (token.sub) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: {
              id: true,
              displayName: true,
              username: true,
              role: true,
              phone: true,
              profilePicture: true,
              email: true,
            },
          })

          console.log('Session callback - user from DB:', user)

          if (user) {
            session.user = {
              ...session.user,
              id: user.id,
              name: user.displayName || user.username || user.email,
              username: user.username,
              role: user.role,
              phone: user.phone,
              image: user.profilePicture,
              email: user.email,
            } as any
          } else {
            console.log('User not found in DB, using token data instead')
            session.user = {
              ...session.user,
              id: token.sub as string,
              name: token.displayName as string,
              username: token.username as string,
              role: token.role as string,
              phone: token.phone as string,
              image: token.picture as string,
              email: token.email as string,
            } as any
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      console.log('Session callback - returning session:', session)
      return session
    },
  },
}
