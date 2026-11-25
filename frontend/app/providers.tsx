'use client'

import { usePathname } from 'next/navigation'
import { AnimitasProvider } from '@/contexts/animitas-context'
import { UserProvider } from '@/contexts/user-context'
import { TruckTransition } from '@/components/truck-transition'

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'

  return (
    <UserProvider>
      <AnimitasProvider>
        {isAuthPage ? (
          children
        ) : (
          <div className="min-h-svh w-full relative bg-background">
            {children}
          </div>
        )}
        <TruckTransition />
      </AnimitasProvider>
    </UserProvider>
  )
}
