'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function NonDrawerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status, data: session } = useSession()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.id && pathname === '/auth') {
      router.push('/')
    }
  }, [status, session, router, pathname])

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
