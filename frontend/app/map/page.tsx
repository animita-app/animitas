'use client'

import { useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import MapboxMap from '@/components/map/mapbox-map'
import { AnalysisPanel } from '@/components/analysis-panel'
import { AnalysisResult } from '@/lib/analysis-engine'

export default function MapaPage() {
  const pathname = usePathname()
  const params = useParams()
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNhcnVzbWluZCIsImEiOiJjbWc4c2puMDIwYWxqMmxwczF0cWY2azZyIn0.YiZOCFkJJbVqu5lJwv9akQ'

  const focusedMemorialId = pathname?.startsWith('/animita/') ? (params?.id as string) : null
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)

  return (
    <div className="h-screen w-screen relative">
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
