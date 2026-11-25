'use client'

import { animitaHref } from '@/lib/routes'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type mapboxgl from 'mapbox-gl'
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
import { areaBounds } from '@/lib/area'
import { CutoutText } from '@/components/cutout-text'

const HIGH_ZOOM_THRESHOLD = 10

interface MapboxMapProps {
  accessToken: string
  style?: string
}

export default function MapboxMap({ accessToken, style }: MapboxMapProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { animitas, mapTarget, clearMapTarget, status, reload, resetToken, area } = useAnimitas()
  const { mapContainer, map, isMapReady } = useMapInitialization({ accessToken, style })
  const { selectedAnimita, selectAnimita } = useAnimitaSelection()
  const { focusAnimita, resetView } = useMapEvents({ map: map.current })

  const [currentZoom, setCurrentZoom] = useState(0)
  // Away from the starting view of all of Chile: the retorno sign shows to bring it back.
  const [away, setAway] = useState(false)

  useEffect(() => {
    const instance = map.current
    if (!instance || !isMapReady) return
    // Away once zoomed in or dragged off: comparing only the zoom missed a map pushed to one side.
    const home = instance.getCenter()
    const check = () => {
      const c = instance.getCenter()
      const moved = Math.abs(c.lng - home.lng) > 1.5 || Math.abs(c.lat - home.lat) > 1.5
      setAway(moved || instance.getZoom() > instance.getMinZoom() + 0.4)
    }
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

  // Closing an animita's sheet lets go of it on the map too.
  useEffect(() => {
    if (!pathname.startsWith('/animita/')) selectAnimita(null)
  }, [pathname, selectAnimita])

  // Going back to the map closes the open sheet: a click on empty map or the start of a drag. Clicks on an
  // animita or a cluster are theirs to handle.
  useEffect(() => {
    const instance = map.current
    if (!instance || !isMapReady || !pathname.startsWith('/animita/')) return
    const inkLayers = ['clusters', 'memorials-inner'].filter(id => instance.getLayer(id))
    const close = () => router.back()
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      if (instance.queryRenderedFeatures(e.point, { layers: inkLayers }).length) return
      close()
    }
    const onDrag = (e: { originalEvent?: Event }) => { if (e.originalEvent) close() }
    instance.on('click', onClick)
    instance.on('dragstart', onDrag)
    return () => {
      instance.off('click', onClick)
      instance.off('dragstart', onDrag)
    }
  }, [map, isMapReady, pathname, router])

  // The chosen area, outlined in the same ballpoint as the marks, and framed.
  useEffect(() => {
    const instance = map.current
    if (!instance || !isMapReady) return
    // Only a real outline is drawn; a place's box would read as a strange rectangle on the map.
    const data = area && !area.rough ? { type: 'Feature' as const, properties: {}, geometry: area.geometry } : { type: 'FeatureCollection' as const, features: [] }
    const source = instance.getSource('area') as mapboxgl.GeoJSONSource | undefined
    if (source) source.setData(data as any)
    else {
      instance.addSource('area', { type: 'geojson', data: data as any })
      // Under the marks, so the outline never covers an animita.
      const below = instance.getLayer('clusters') ? 'clusters' : undefined
      instance.addLayer({ id: 'area-fill', type: 'fill', source: 'area', paint: { 'fill-color': '#2c3f8c', 'fill-opacity': 0.04 } }, below)
      instance.addLayer({ id: 'area-line', type: 'line', source: 'area', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#2c3f8c', 'line-width': 2, 'line-opacity': 0.75, 'line-blur': 0.6 } }, below)
    }
    if (area) {
      const [w, s, e, n] = areaBounds(area.geometry)
      instance.fitBounds([[w, s], [e, n]], { padding: { top: 120, bottom: 160, left: 48, right: 48 }, duration: 900, essential: true })
    }
  }, [area, map, isMapReady])

  // An animita opened any way (search, list, a link) brings the map to it, not only a click on its point.
  useEffect(() => {
    if (!isMapReady) return
    const slug = pathname.match(/^\/animita\/([^/]+)/)?.[1]
    if (!slug) return
    const site = animitas.find(a => a.slug === decodeURIComponent(slug))
    if (!site) return
    selectAnimita(site)
    focusAnimita([site.location.lng, site.location.lat])
  }, [pathname, isMapReady, animitas, selectAnimita, focusAnimita])

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

      <MapStatus status={status} count={animitas.length} onRetry={reload} area={area?.label} />

      {/* Above the shelf's paper fade, which sits over the map, so it can live in the corner. */}
      {away && !pathname.startsWith('/animita/') && createPortal(
        <button
          type="button"
          onClick={resetView}
          aria-label="Ver todo Chile"
          className="group fixed right-4 bottom-28 z-60 rounded-xs outline-none transition-[scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-in fade-in zoom-in-90 hover:scale-110 hover:-rotate-3 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none md:right-8 md:bottom-8"
        >
          <RetornoSign className="size-14" />
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 w-max -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
            <CutoutText text="retorno" height={18} />
          </span>
        </button>
      , document.body)}

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
