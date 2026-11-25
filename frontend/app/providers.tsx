'use client'

import { usePathname } from 'next/navigation'
import { AnimitasProvider } from '@/contexts/animitas-context'
import { UserProvider } from '@/contexts/user-context'
import { SheetProvider } from '@/contexts/sheet-context'
import { PageArrive } from '@/components/page-arrive'

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
        <SheetProvider>
        {isAuthPage ? (
          children
        ) : (
          <div className="min-h-svh w-full relative bg-background">
            {children}
          </div>
        )}
        <PageArrive />
        </SheetProvider>
      </AnimitasProvider>
    </UserProvider>
  )
}
