'use client'

import { useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import MapboxMap from '@/components/map/mapbox-map'
import { AnalysisPanel } from '@/components/analysis-panel'
import { AnalysisResult } from '@/lib/analysis-engine'

export default function MapaPage() {
  const pathname = usePathname()
  const params = useParams()
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="text-center">
          <p className="text-text-strong font-semibold mb-2">Mapbox configuration error</p>
          <p className="text-text-weak text-sm">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not configured</p>
        </div>
      </div>
    )
  }

  const focusedMemorialId = pathname?.startsWith('/animita/') ? (params?.id as string) : null

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <MapboxMap
          accessToken={mapboxToken}
          focusedHeritageSiteId={focusedMemorialId}
          isModal={false}
          onAnalysisRequested={setAnalysisData}
        />
      </div>
      <AnalysisPanel
        data={analysisData}
        onClose={() => setAnalysisData(null)}
      />
    </div>
  )
}
