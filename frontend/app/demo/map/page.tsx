/**
 * Demo Mode - Map Component
 *
 * Showcases the interactive map with markers, clustering, and navigation
 */

'use client'

import dynamic from 'next/dynamic'
import { SpatialProvider } from '@/contexts/spatial-context'
import { UserProvider } from '@/contexts/user-context'

// Dynamically import map to avoid SSR issues
const MapboxMap = dynamic(() => import('@/components/map/mapbox-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-sm text-neutral-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

export default function MapDemoPage() {
  return (
    <UserProvider>
      <SpatialProvider>
        <div className="w-full h-full relative">
          {/* Map fills entire demo container */}
          <MapboxMap accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''} />

          {/* Optional: Add demo instructions overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm">
            Explora animitas en todo Chile
          </div>
        </div>
      </SpatialProvider>
    </UserProvider>
  )
}
