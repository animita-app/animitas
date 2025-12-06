'use client'

import { usePathname } from 'next/navigation'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="h-screen w-screen relative bg-background">
      {children}
    </div>
  )
}
