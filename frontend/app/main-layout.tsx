'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import MapboxMap from '@/components/map/mapbox-map'
import { TopHeader } from '@/components/layout/top-header'

const HEADER_HEIGHT = 64
const DRAWER_HEIGHT = 128

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNhcnVzbWluZCIsImEiOiJjbWc4c2puMDIwYWxqMmxwczF0cWY2azZyIn0.YiZOCFkJJbVqu5lJwv9akQ'
  const [centerOffset, setCenterOffset] = useState<[number, number]>([0, 0])

  useEffect(() => {
    const calculateOffset = () => {
      try {
        const viewportHeight = window.innerHeight
        const availableHeight = viewportHeight - HEADER_HEIGHT - DRAWER_HEIGHT
        const viewportCenter = viewportHeight / 2
        const availableCenter = HEADER_HEIGHT + availableHeight / 2
        const offset = availableCenter - viewportCenter
        setCenterOffset([0, -offset])
      } catch (error) {
        setCenterOffset([0, 0])
      }
    }

    calculateOffset()
    window.addEventListener('resize', calculateOffset)
    return () => window.removeEventListener('resize', calculateOffset)
  }, [])

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <TopHeader />
      <div className="h-screen w-screen md:w-3/4 relative">
        <MapboxMap accessToken={mapboxToken} centerOffset={centerOffset} />
        {children}
      </div>
    </>
  )
}
