/**
 * Demo Mode - Detail Page Component
 *
 * Showcases a heritage site detail page with story, images, and info
 */

'use client'

import { UserProvider } from '@/contexts/user-context'
import { SpatialProvider } from '@/contexts/spatial-context'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DetailDemoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Redirect to a real detail page for demo
    // Using Hermógenes San Martín as it has rich content
    router.push('/demo/detail/hermogenes')
  }, [router])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return null
}
