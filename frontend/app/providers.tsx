'use client'

import { usePathname } from 'next/navigation'
import { SpatialProvider } from '@/contexts/spatial-context'
import { UserProvider } from '@/contexts/user-context'

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'

  return (
    <UserProvider>
      <SpatialProvider>
        {isAuthPage ? (
          children
        ) : (
          <div className="min-h-screen w-screen relative bg-background">
            {children}
          </div>
        )}
      </SpatialProvider>
    </UserProvider>
  )
}
