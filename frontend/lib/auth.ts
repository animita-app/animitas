import NextAuth, { type Session } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'

const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      id: 'sms',
      name: 'SMS',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null
        }

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
          email: user.email,
          name: user.displayName,
          image: user.profilePicture,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
