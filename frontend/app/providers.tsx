'use client'

import { SessionProvider } from 'next-auth/react'
import MainLayout from './main-layout'

export function Providers({
  children,
  session,
  modal,
}: {
  children: React.ReactNode
  session: any
  modal: React.ReactNode
}) {
  return (
    <SessionProvider session={session}>
      <MainLayout modal={modal}>{children}</MainLayout>
    </SessionProvider>
  )
}
