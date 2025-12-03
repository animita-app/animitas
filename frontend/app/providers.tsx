'use client'

import MainLayout from './main-layout'

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>{children}</MainLayout>
  )
}
