'use client'

import MainLayout from './main-layout'
import { useSeed } from '@/hooks/use-seed'

function SeedInitializer({ children }: { children: React.ReactNode }) {
  useSeed()
  return <>{children}</>
}

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SeedInitializer>
      <MainLayout>{children}</MainLayout>
    </SeedInitializer>
  )
}
