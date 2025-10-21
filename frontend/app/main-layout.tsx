'use client'

import { usePathname } from 'next/navigation'
import MapboxMap from '@/components/map/mapbox-map'
import { TopHeader } from '@/components/layout/top-header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNhcnVzbWluZCIsImEiOiJjbWc4c2puMDIwYWxqMmxwczF0cWY2azZyIn0.YiZOCFkJJbVqu5lJwv9akQ'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <TopHeader />
      <div className="h-screen w-screen md:w-3/4 relative">
        <MapboxMap accessToken={mapboxToken} />
        {children}
      </div>
    </>
  )
}
