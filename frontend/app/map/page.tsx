'use client'

import MapboxMap from '@/components/map/mapbox-map'

export default function MapaPage() {
  return (
    <div className="h-svh w-screen relative overflow-hidden">
      <MapboxMap accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''} />
    </div>
  )
}
