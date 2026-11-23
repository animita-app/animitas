'use client'

import { animitaHref } from '@/lib/routes'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Map as MapIcon } from 'lucide-react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { useMapInitialization } from './hooks/use-map-initialization'
import { useMapEvents } from './hooks/use-map-events'
import { useHeritageSiteSelection } from '@/hooks/use-heritage-site-selection'
import { useVisibleSites } from '@/hooks/use-visible-sites'
import { MarkerLayer } from './layers/marker-layer'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HeritageSite } from '@/types/heritage'

const HIGH_ZOOM_THRESHOLD = 10

interface MapboxMapProps {
  accessToken: string
  style?: string
}

export default function MapboxMap({ accessToken, style }: MapboxMapProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { filteredData, mapResetToken, mapTarget } = useSpatialContext()
  const { mapContainer, map, isMapReady } = useMapInitialization({ accessToken, style })
  const { selectedHeritageSite, handleHeritageSiteSelect } = useHeritageSiteSelection()
  const { focusHeritageSite, resetView } = useMapEvents({ map: map.current })

  const [currentZoom, setCurrentZoom] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)
  const initialViewState = useRef<{ zoom: number; center: { lng: number; lat: number } } | null>(null)

  const visibleSites = useVisibleSites({
    map: map.current,
    isMapReady,
    currentZoom,
    zoomThreshold: HIGH_ZOOM_THRESHOLD,
    filteredData,
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
    if (mapResetToken > 0 && isMapReady) {
      resetView()
      setHasMoved(false)
    }
  }, [mapResetToken, isMapReady, resetView])

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
    const site = filteredData.find((s: HeritageSite) => s.id === id)
    if (!site) return

    handleHeritageSiteSelect(site)
    focusHeritageSite([site.location.lng, site.location.lat])
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

      <MarkerLayer
        map={map.current}
        isMapReady={isMapReady}
        data={filteredData}
        onSiteClick={handleMarkerClick}
        currentZoom={currentZoom}
        visibleSites={visibleSites}
        selectedSite={selectedHeritageSite}
        onSiteSelect={handleHeritageSiteSelect}
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
