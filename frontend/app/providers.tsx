'use client'

import { SpatialProvider } from '@/contexts/spatial-context'
import MainLayout from './main-layout'

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SpatialProvider>
      <MainLayout>{children}</MainLayout>
    </SpatialProvider>
  )
}
