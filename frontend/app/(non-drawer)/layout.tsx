'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function NonDrawerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    if (!loading) {
      if (user && pathname === '/auth') {
        router.push('/')
      } else if (!user && pathname !== '/auth') {
        router.push('/auth')
      }
    }
  }, [loading, user, router, pathname])

  if (loading) {
    return (
      <div className="fixed inset-0 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
