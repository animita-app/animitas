'use client'

import { animitaHref } from '@/lib/routes'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAnimitas } from '@/contexts/animitas-context'
import { useMapInitialization } from './hooks/use-map-initialization'
import { useMapEvents } from './hooks/use-map-events'
import { useAnimitaSelection } from '@/hooks/use-animita-selection'
import { useVisibleSites } from '@/hooks/use-visible-sites'
import { MarkerLayer } from './layers/marker-layer'
import { MapStatus } from './map-status'
import { Animita } from '@/types/animita'

const HIGH_ZOOM_THRESHOLD = 10

interface MapboxMapProps {
  accessToken: string
  style?: string
}

export default function MapboxMap({ accessToken, style }: MapboxMapProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { animitas, mapTarget, clearMapTarget, status, reload, resetToken } = useAnimitas()
  const { mapContainer, map, isMapReady } = useMapInitialization({ accessToken, style })
  const { selectedAnimita, selectAnimita } = useAnimitaSelection()
  const { focusAnimita, resetView } = useMapEvents({ map: map.current })

  const [currentZoom, setCurrentZoom] = useState(0)

  const visibleSites = useVisibleSites({
    map: map.current,
    isMapReady,
    currentZoom,
    zoomThreshold: HIGH_ZOOM_THRESHOLD,
    animitas,
    maxVisibleSites: 20
  })

  useEffect(() => {
    const instance = map.current
    if (!instance || !isMapReady) return

    const updateZoom = () => setCurrentZoom(instance.getZoom())
    instance.on('zoom', updateZoom)
    updateZoom()

    return () => {
      instance.off('zoom', updateZoom)
    }
  }, [map, isMapReady])

  useEffect(() => {
    const instance = map.current
    if (!mapTarget || !instance || !isMapReady) return
    if (mapTarget.bbox) {
      const [minLng, minLat, maxLng, maxLat] = mapTarget.bbox
      instance.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 48, essential: true })
    } else if (mapTarget.center) {
      instance.flyTo({ center: mapTarget.center, zoom: 14, essential: true })
    }
    // Spent once flown, so coming back to the map later starts from all of Chile again.
    clearMapTarget()
  }, [map, mapTarget, isMapReady, clearMapTarget])

  const handleMarkerClick = (id: string) => {
    const site = animitas.find((s: Animita) => s.id === id)
    if (!site) return

    selectAnimita(site)
    focusAnimita([site.location.lng, site.location.lat])
    const href = animitaHref(site.slug || site.id)
    // With a sheet already open, swap it so closing returns to the map instead of the previous animita.
    if (pathname.startsWith('/animita/')) router.replace(href)
    else router.push(href)
  }

  useEffect(() => {
    if (resetToken > 0 && isMapReady) resetView()
  }, [resetToken, isMapReady, resetView])

  return (
    <div className="relative size-full">
      <div ref={mapContainer} className="absolute inset-0" />

      <MapStatus status={status} count={animitas.length} onRetry={reload} />

      <MarkerLayer
        map={map.current}
        isMapReady={isMapReady}
        data={animitas}
        onSiteClick={handleMarkerClick}
        currentZoom={currentZoom}
        visibleSites={visibleSites}
        selectedSite={selectedAnimita}
        onSiteSelect={selectAnimita}
      />

    </div>
  )
}
