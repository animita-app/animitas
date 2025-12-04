'use client'

import { SpatialProvider } from '@/contexts/spatial-context'
import { UserProvider } from '@/contexts/user-context'
import MainLayout from './main-layout'

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <SpatialProvider>
        <MainLayout>{children}</MainLayout>
      </SpatialProvider>
    </UserProvider>
  )
}
