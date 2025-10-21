'use client'

import { SessionProvider } from 'next-auth/react'
import MainLayout from './main-layout'

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  return (
    <SessionProvider session={session}>
      <MainLayout>{children}</MainLayout>
    </SessionProvider>
  )
}
