'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { COLORS } from '@/lib/map-style'
import { HeritageSite } from '@/types/heritage'
import { MapMarker } from '../map-marker'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
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
        maxzoom: 24,
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
        maxzoom: 24,
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
      const id = e.features[0].properties?.id
      if (id) {
        cancelClose()
        setActiveId(id)
        setLockedId(id)
        onSiteClick?.(id, e.features[0])
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
      if (!e.features?.length) return
      const clusterId = e.features[0].properties?.cluster_id
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return
        map.flyTo({
          center: (e.features![0].geometry as any).coordinates,
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
            className="z-20"
          >
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
                    <ArrowUpRight />
                  </Button>
                </Link>
              </div>
            </div>
          </MapMarker>
        )
      })}
    </>
  )
}
