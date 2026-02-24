/**
 * Demo Mode - Research Mode Component
 *
 * Showcases advanced GIS features, charts, and spatial filtering
 */

'use client'

import { UserProvider } from '@/contexts/user-context'
import { SpatialProvider } from '@/contexts/spatial-context'
import dynamic from 'next/dynamic'

const MapPage = dynamic(() => import('@/app/map/page'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  )
})

export default function ResearchDemoPage() {
  return (
    <UserProvider>
      <SpatialProvider>
        <div className="w-full h-full">
          <MapPage />

          {/* Demo hint overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm z-50">
            Activa el Modo Investigación en el header →
          </div>
        </div>
      </SpatialProvider>
    </UserProvider>
  )
}
