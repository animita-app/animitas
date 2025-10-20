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
      if (user) {
        token.sub = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.displayName = (user as any).displayName
      }
      return token
    },
    async session({ session, token }) {
      const newUser = {
        ...session.user,
        id: token.sub,
        role: token.role,
        phone: token.phone,
        displayName: token.displayName,
      };
      session.user = newUser;
      return session;
    },
  },
}
