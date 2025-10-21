'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import MapboxMap from '@/components/map/mapbox-map'
import { TopHeader } from '@/components/layout/top-header'

const HEADER_HEIGHT = 64
const MODAL_SNAP_POINT_PX = 720

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNhcnVzbWluZCIsImEiOiJjbWc4c2puMDIwYWxqMmxwczF0cWY2azZyIn0.YiZOCFkJJbVqu5lJwv9akQ'
  const [centerOffset, setCenterOffset] = useState<[number, number]>([0, 0])

  useEffect(() => {
    const calculateOffset = () => {
      try {
        const viewportHeight = window.innerHeight
        const targetCenterY = HEADER_HEIGHT + (MODAL_SNAP_POINT_PX - HEADER_HEIGHT) / 2
        const viewportCenterY = viewportHeight / 2
        const pixelOffset = targetCenterY - viewportCenterY
        setCenterOffset([0, pixelOffset * 0.6])
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
