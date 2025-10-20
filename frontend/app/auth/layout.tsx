'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status, data: session } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.id) {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'authenticated' && (session?.user as any)?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
