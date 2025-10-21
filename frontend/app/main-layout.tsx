'use client'

import { usePathname, useParams } from 'next/navigation'
import MapboxMap from '@/components/map/mapbox-map'
import { TopHeader } from '@/components/layout/top-header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const isAuthPage = pathname === '/auth'
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNhcnVzbWluZCIsImEiOiJjbWc4c2puMDIwYWxqMmxwczF0cWY2azZyIn0.YiZOCFkJJbVqu5lJwv9akQ'

  const focusedMemorialId = pathname.startsWith('/animita/') ? (params.id as string) : null

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <TopHeader />
      <div className="h-screen w-screen relative">
        <MapboxMap accessToken={mapboxToken} focusedMemorialId={focusedMemorialId} isModal={false} />
        {children}
      </div>
    </>
  )
}
