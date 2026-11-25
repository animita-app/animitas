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
import { RetornoSign } from '@/components/road-signs'
import { CutoutText } from '@/components/cutout-text'

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
  // Away from the starting view of all of Chile: the retorno sign shows to bring it back.
  const [away, setAway] = useState(false)

  useEffect(() => {
    const instance = map.current
    if (!instance || !isMapReady) return
    const check = () => setAway(instance.getZoom() > instance.getMinZoom() + 0.4)
    instance.on('moveend', check)
    check()
    return () => { instance.off('moveend', check) }
  }, [map, isMapReady])

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

      {away && (
        <button
          type="button"
          onClick={resetView}
          aria-label="Ver todo Chile"
          className="group absolute right-4 bottom-48 z-10 rounded-xs outline-none transition-[scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-in fade-in zoom-in-90 hover:scale-110 hover:-rotate-3 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none md:right-6"
        >
          <RetornoSign className="size-14" />
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 w-max -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
            <CutoutText text="retorno" height={18} />
          </span>
        </button>
      )}

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
