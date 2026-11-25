'use client'

import { animitaHref } from '@/lib/routes'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Map as MapIcon } from 'lucide-react'
import { useAnimitas } from '@/contexts/animitas-context'
import { useMapInitialization } from './hooks/use-map-initialization'
import { useMapEvents } from './hooks/use-map-events'
import { useAnimitaSelection } from '@/hooks/use-animita-selection'
import { useVisibleSites } from '@/hooks/use-visible-sites'
import { MarkerLayer } from './layers/marker-layer'
import { MapStatus } from './map-status'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Animita } from '@/types/animita'

const HIGH_ZOOM_THRESHOLD = 10

interface MapboxMapProps {
  accessToken: string
  style?: string
}

export default function MapboxMap({ accessToken, style }: MapboxMapProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { animitas, mapTarget, status, reload } = useAnimitas()
  const { mapContainer, map, isMapReady } = useMapInitialization({ accessToken, style })
  const { selectedAnimita, selectAnimita } = useAnimitaSelection()
  const { focusAnimita, resetView } = useMapEvents({ map: map.current })

  const [currentZoom, setCurrentZoom] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)
  const initialViewState = useRef<{ zoom: number; center: { lng: number; lat: number } } | null>(null)

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

    if (!initialViewState.current) {
      const center = instance.getCenter()
      initialViewState.current = { zoom: instance.getZoom(), center: { lng: center.lng, lat: center.lat } }
    }

    const updateZoom = () => setCurrentZoom(instance.getZoom())
    const checkMovement = () => {
      const initial = initialViewState.current
      if (!initial) return
      const center = instance.getCenter()
      const isZoomSame = Math.abs(instance.getZoom() - initial.zoom) < 0.5
      const isCenterSame = Math.abs(center.lng - initial.center.lng) < 0.1 && Math.abs(center.lat - initial.center.lat) < 0.1
      setHasMoved(!isZoomSame || !isCenterSame)
    }

    instance.on('zoom', updateZoom)
    instance.on('moveend', checkMovement)
    updateZoom()

    return () => {
      instance.off('zoom', updateZoom)
      instance.off('moveend', checkMovement)
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
  }, [map, mapTarget, isMapReady])

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

  const handleResetView = () => {
    resetView()
    setHasMoved(false)
  }

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

      {hasMoved && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Ver todo Chile"
              className="absolute bottom-safe right-4 z-10"
              onClick={handleResetView}
            >
              <MapIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Ver todo Chile</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
