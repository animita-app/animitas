'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { COLORS } from '@/lib/map-style'
import { HeritageSite } from '@/types/heritage'
import { MapMarker } from '../map-marker'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MarkerLayerProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  data: any[]
  onSiteClick?: (id: string, feature: mapboxgl.MapboxGeoJSONFeature) => void
  sourceId?: string
  currentZoom: number
  visibleSites: HeritageSite[]
  selectedSite: HeritageSite | null
  onSiteSelect?: (site: HeritageSite | null) => void
}

const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 20,
  clusterRadius: 25,
}

const POINT_FILTER = ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'geom_type'], 'polygon']] as any
const ZOOM_THRESHOLD = 13;

export function MarkerLayer({
  map,
  isMapReady,
  data,
  onSiteClick,
  sourceId = 'memorials',
  currentZoom,
  visibleSites,
  selectedSite,
  onSiteSelect,
}: MarkerLayerProps) {
  const isInitialized = useRef(false)
  const [activeId, setActiveId] = useState<string | null>(selectedSite?.id || null)
  const [lockedId, setLockedId] = useState<string | null>(selectedSite?.id || null)
  const lockedIdRef = useRef<string | null>(lockedId)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    lockedIdRef.current = lockedId
  }, [lockedId])

  useEffect(() => {
    if (selectedSite?.id) {
      setLockedId(selectedSite.id)
      setActiveId(selectedSite.id)
    }
  }, [selectedSite?.id])

  const cancelClose = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveId(lockedIdRef.current)
    }, 300)
  }, [cancelClose])

  // 1. Initialize sources and layers
  useEffect(() => {
    if (!map || !isMapReady || isInitialized.current) return

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'id',
        ...CLUSTER_CONFIG,
      })
    }

    if (!map.getSource(`${sourceId}-polygons`)) {
      map.addSource(`${sourceId}-polygons`, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    if (!map.getLayer(`${sourceId}-polygon-fill`)) {
      map.addLayer({
        id: `${sourceId}-polygon-fill`,
        type: 'fill',
        source: `${sourceId}-polygons`,
        paint: { 'fill-color': COLORS.animitas, 'fill-opacity': 0.12 },
      })
    }

    if (!map.getLayer(`${sourceId}-polygon-outline`)) {
      map.addLayer({
        id: `${sourceId}-polygon-outline`,
        type: 'line',
        source: `${sourceId}-polygons`,
        paint: { 'line-color': COLORS.animitas, 'line-width': 1.5, 'line-opacity': 0.85 },
      })
    }

    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], 'transparent', 10, 'transparent', 30, 'transparent'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
          'circle-opacity': 0.85,
          'circle-stroke-color': COLORS.animitas,
          'circle-stroke-width': 1.5,
        },
      })
    }

    if (!map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
        },
        paint: { 'text-color': COLORS.animitas },
      })
    }

    if (!map.getLayer(`${sourceId}-outer`)) {
      map.addLayer({
        id: `${sourceId}-outer`,
        type: 'circle',
        source: sourceId,
        filter: POINT_FILTER,
        maxzoom: ZOOM_THRESHOLD,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 8, 6, 18, 12, 24, 18, 32],
          'circle-color': 'transparent',
          'circle-opacity': 0.85,
          'circle-stroke-color': COLORS.animitas,
          'circle-stroke-width': 1.5,
        },
      })
    }

    if (!map.getLayer(`${sourceId}-inner`)) {
      map.addLayer({
        id: `${sourceId}-inner`,
        type: 'circle',
        source: sourceId,
        filter: POINT_FILTER,
        maxzoom: ZOOM_THRESHOLD,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 2.5, 6, 6, 12, 8, 18, 12],
          'circle-color': COLORS.animitas,
          'circle-opacity': 0.92,
        },
      })
    }

    isInitialized.current = true
  }, [map, isMapReady, sourceId])

  // 2. Update point data
  useEffect(() => {
    if (!map || !isMapReady) return
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
    if (!source) return
    source.setData({
      type: 'FeatureCollection',
      features: data.map(site => ({
        type: 'Feature',
        id: site.id,
        geometry: { type: 'Point', coordinates: [site.location.lng, site.location.lat] },
        properties: { ...site, geom_type: site.rawGeometry ? 'polygon' : 'point' },
      })),
    } as any)
  }, [map, isMapReady, data, sourceId])

  // 3. Update polygon data
  useEffect(() => {
    if (!map || !isMapReady) return
    const source = map.getSource(`${sourceId}-polygons`) as mapboxgl.GeoJSONSource
    if (!source) return
    source.setData({
      type: 'FeatureCollection',
      features: data
        .filter(site => site.rawGeometry)
        .map(site => ({
          type: 'Feature',
          id: site.id,
          geometry: site.rawGeometry,
          properties: { id: site.id, title: site.title },
        })),
    } as any)
  }, [map, isMapReady, data, sourceId])

  // 4. Handle events
  useEffect(() => {
    if (!map || !isMapReady) return

    const layersToClick = [`${sourceId}-inner`, `${sourceId}-outer`]

    const onPointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      e.originalEvent.stopPropagation()
      if (!e.features?.length) return
      const feature = e.features[0]
      const id = feature.properties?.id
      if (id) {
        cancelClose()
        setActiveId(id)
        setLockedId(id)
        onSiteClick?.(id, feature)
      }
    }

    const onPointEnter = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features?.length) return
      const id = e.features[0].properties?.id
      if (id) {
        cancelClose()
        setActiveId(id)
        map.getCanvas().style.cursor = 'pointer'
      }
    }

    const onPointLeave = () => {
      scheduleClose()
      map.getCanvas().style.cursor = ''
    }

    const onClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      const feature = e.features?.[0]
      if (!feature) return
      
      const clusterId = feature.properties?.cluster_id
      const geometry = feature.geometry as any
      const coordinates = geometry?.coordinates
      
      if (clusterId == null || !coordinates) return

      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
      if (!source) return

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return
        map.flyTo({
          center: coordinates,
          zoom,
          speed: 1.2,
          curve: 1,
          essential: true,
          duration: 500,
        })
      })
    }

    const onClusterEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onClusterLeave = () => { map.getCanvas().style.cursor = '' }

    layersToClick.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.on('click', layerId, onPointClick)
        map.on('mouseenter', layerId, onPointEnter)
        map.on('mouseleave', layerId, onPointLeave)
      }
    })

    if (map.getLayer('clusters')) {
      map.on('click', 'clusters', onClusterClick)
      map.on('mouseenter', 'clusters', onClusterEnter)
      map.on('mouseleave', 'clusters', onClusterLeave)
    }

    return () => {
      layersToClick.forEach(layerId => {
        try {
          if (map.getStyle() && map.getLayer(layerId)) {
            map.off('click', layerId, onPointClick)
            map.off('mouseenter', layerId, onPointEnter)
            map.off('mouseleave', layerId, onPointLeave)
          }
        } catch (_) {}
      })
      try {
        if (map.getStyle() && map.getLayer('clusters')) {
          map.off('click', 'clusters', onClusterClick)
          map.off('mouseenter', 'clusters', onClusterEnter)
          map.off('mouseleave', 'clusters', onClusterLeave)
        }
      } catch (_) {}
    }
  }, [map, isMapReady, onSiteClick, sourceId, cancelClose, scheduleClose])

  const sitesToRender = currentZoom >= 10 ? visibleSites : (selectedSite ? [selectedSite] : [])
  const isZoomedIn = currentZoom >= ZOOM_THRESHOLD

  return (
    <>
      {map && sitesToRender.map(site => {
        const kind = (site as any).kind || 'animita'
        const href = `/${kind.toLowerCase()}/${site.slug || site.id}`
        const isActive = activeId === site.id
        const topValue = 38 + ((Math.min(currentZoom, 22) - 10) * 1.25)

        return (
          <MapMarker
            key={site.id}
            map={map}
            coordinates={[site.location.lng, site.location.lat]}
            className={cn("z-20 transition-all duration-300", isActive ? "z-50" : "z-20")}
          >
            {isZoomedIn ? (
              <div 
                className="flex flex-col items-center pointer-events-auto"
                onMouseEnter={() => { cancelClose(); setActiveId(site.id); }}
                onMouseLeave={scheduleClose}
                onClick={() => {
                  cancelClose()
                  setActiveId(site.id)
                  setLockedId(site.id)
                  // For the HTML marker, 'onSiteClick' handles the panel opening directly 
                  // if it's passed, otherwise the Link handles navigation.
                  if (onSiteClick) {
                    onSiteClick(site.id, { properties: { id: site.id }, geometry: { type: 'Point', coordinates: [site.location.lng, site.location.lat] } } as any)
                  }
                }}
              >
                <Link
                  href={href}
                  prefetch={false}
                  className={cn(
                    "relative flex pb-2 flex-col items-center justify-center transition-all ease-out",
                    isActive ? "scale-110 drop-shadow-xl" : "scale-100 drop-shadow-md hover:scale-105"
                  )}
                >
                  <div className="relative rounded-full bg-background p-1 border shadow-xs border-border/50">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-[6px] border-transparent border-t-background border-t-[8px]" />
                    
                    {site.images && site.images.length > 0 ? (
                      <div className="w-9 h-9 overflow-hidden rounded-full bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={site.images[0]}
                          alt={site.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#00e]/10 text-[#00e]">
                        <MapPin className="size-4" />
                      </div>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="absolute bottom-full mb-1 whitespace-nowrap bg-background px-2 py-1 rounded-md shadow-lg border text-xs font-semibold border-border text-foreground">
                      {site.title || 'Animita'}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center overflow-visible">
                <div
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                  className={cn(
                    'transition-all duration-200 ease-out origin-top',
                    isActive
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  )}
                >
                  <Link
                    href={href}
                    prefetch={false}
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-50 flex flex-col items-center gap-1.5"
                    style={{ top: `${topValue}px` }}
                  >
                    <span className="text-base font-medium text-text-strong [text-shadow:-1px_-1px_0_white,1px_-1px_0_white,-1px_1px_0_white,1px_1px_0_white,0_2px_4px_rgba(0,0,0,0.4)] shadow-xs">
                      {site.title || 'Animita'}
                    </span>
                    <Button
                      size="sm"
                      className="sr-only h-6 text-xs px-2.5 rounded-full shadow-md gap-1 pointer-events-none"
                    >
                      Ver detalles
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </MapMarker>
        )
      })}
    </>
  )
}
