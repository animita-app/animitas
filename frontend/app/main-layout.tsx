'use client'

import { usePathname, useParams } from 'next/navigation'
import { useState } from 'react'
import MapboxMap from '@/components/map/mapbox-map'

import { AnalysisPanel } from '@/components/analysis-panel'
import { AnalysisResult } from '@/lib/analysis-engine'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const params = useParams()
  const isAuthPage = pathname === '/auth'
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNhcnVzbWluZCIsImEiOiJjbWc4c2puMDIwYWxqMmxwczF0cWY2azZyIn0.YiZOCFkJJbVqu5lJwv9akQ'

  const focusedMemorialId = pathname.startsWith('/animita/') ? (params.id as string) : null
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)

  if (isAuthPage) {
    return <>{children}</>
  }

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
      {children}
    </div>
  )
}
