'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { COLORS, ICONS } from '@/lib/map-style'
import { HeritageSite } from '@/types/heritage'
import { MapMarker } from '../map-marker'


import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

export interface MarkerLayerProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  data: any[] // HeritageSite[]
  onSiteClick?: (id: string, feature: mapboxgl.MapboxGeoJSONFeature) => void
  sourceId?: string
  currentZoom: number
  visibleSites: HeritageSite[]
  selectedSite: HeritageSite | null
  onSiteSelect?: (site: HeritageSite | null) => void
}

const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 20, // Clusters will break apart up to zoom level 20
  clusterRadius: 25
}

export function MarkerLayer({
  map,
  isMapReady,
  data,
  onSiteClick,
  sourceId = 'memorials',
  currentZoom,
  visibleSites,
  selectedSite,
  onSiteSelect
}: MarkerLayerProps) {
  const isInitialized = useRef(false)
  const { role } = useUser()
  const isDefault = role === ROLES.DEFAULT
  const [activeId, setActiveId] = useState<string | null>(selectedSite?.id || null)
  const [lockedId, setLockedId] = useState<string | null>(selectedSite?.id || null)

  // Sync with selectedSite prop
  useEffect(() => {
    if (selectedSite?.id) {
      setLockedId(selectedSite.id)
      setActiveId(selectedSite.id)
    }
  }, [selectedSite?.id])
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout helper
  const cancelClose = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }, [])

  // Schedule close helper
  const scheduleClose = useCallback(() => {
    cancelClose()
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveId(lockedId) // Revert to the locked marker if any
    }, 300) // 300ms grace period
  }, [cancelClose, lockedId])

  // 1. Initialize Source and Layers
  useEffect(() => {
    if (!map || !isMapReady || isInitialized.current) return

    // Add Source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'id', // Use the 'id' property for feature-state
        ...CLUSTER_CONFIG
      })
    }

    // --- Clusters Layers ---
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
          'circle-stroke-width': 1.5
        }
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
          'text-size': 14
        },
        paint: { 'text-color': COLORS.animitas }
      })
    }

    // --- Unclustered Markers (Outer/Inner circles) ---
    // Free users: show circles only at zoom < 10, then switch to images
    // Paid users: show circles at all zoom levels
    if (!map.getLayer(`${sourceId}-outer`)) {
      map.addLayer({
        id: `${sourceId}-outer`,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        maxzoom: 24,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            3, 8,
            6, 18,
            12, 24,
            18, 32
          ],
          'circle-color': 'transparent',
          'circle-opacity': 0.85,
          'circle-stroke-color': COLORS.animitas,
          'circle-stroke-width': 1.5
        }
      })
    }

    if (!map.getLayer(`${sourceId}-inner`)) {
      map.addLayer({
        id: `${sourceId}-inner`,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        maxzoom: 24,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            3, 2.5,
            6, 6,
            12, 8,
            18, 12
          ],
          'circle-color': COLORS.animitas,
          'circle-opacity': 0.92
        }
      })
    }

    // Apply Zoom Range Logic
    if (map.getLayer(`${sourceId}-outer`)) {
      map.setLayerZoomRange(`${sourceId}-outer`, 0, 24)
    }
    if (map.getLayer(`${sourceId}-inner`)) {
      map.setLayerZoomRange(`${sourceId}-inner`, 0, 24)
    }

    isInitialized.current = true
  }, [map, isMapReady, sourceId, isDefault])



  // 2. Update Data
  useEffect(() => {
    if (!map || !isMapReady) return

    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
    if (source) {

      const geojson = {
        type: 'FeatureCollection',
        features: data.map((site) => {
          return {
            type: 'Feature',
            id: site.id, // Add feature ID for feature-state
            geometry: {
              type: 'Point',
              coordinates: [site.location.lng, site.location.lat]
            },
            properties: {
              ...site
            }
          }
        })
      }
      source.setData(geojson as any)
    }
  }, [map, isMapReady, data, sourceId])

  // 3. Handle Events
  useEffect(() => {
    if (!map || !isMapReady) return

    const layersToClick = [`${sourceId}-inner`, `${sourceId}-outer`]


    // Point Click (Mobile/Desktop)
    const onPointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      e.originalEvent.stopPropagation()
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      const id = feature.properties?.id
      if (id) {
        cancelClose()
        setActiveId(id)
        setLockedId(id) // Pin this marker open
        if (onSiteClick) {
          onSiteClick(id, feature)
        }
      }
    }

    // Point Hover (Desktop)
    const onPointEnter = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      const id = feature.properties?.id
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

    // Map Click (Close on background click)
    const onMapClick = () => {
      // We don't clear the activeId or lockedId as per the requirement:
      // "you cant dismiss the container with the link animita and ver detalle thing"
    }

    // Cluster Click
    const onClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      const clusterId = feature.properties?.cluster_id
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom === null || zoom === undefined) return
        map.flyTo({
          center: (feature.geometry as any).coordinates,
          zoom: zoom,
          speed: 1.2,
          curve: 1,
          essential: true,
          duration: 500
        })
      })
    }

    const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onMouseLeave = () => { map.getCanvas().style.cursor = '' }

    // Register Point Events
    layersToClick.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.on('click', layerId, onPointClick)
        map.on('mouseenter', layerId, onPointEnter)
        map.on('mouseleave', layerId, onPointLeave)
      }
    })

    // Global Map Click to close
    map.on('click', onMapClick)

    // Register Cluster Events
    if (map.getLayer('clusters')) {
      map.on('click', 'clusters', onClusterClick)
      map.on('mouseenter', 'clusters', onMouseEnter)
      map.on('mouseleave', 'clusters', onMouseLeave)
    }



    return () => {
      // Cleanup
      layersToClick.forEach(layerId => {
        try {
          if (map.getStyle() && map.getLayer(layerId)) {
            map.off('click', layerId, onPointClick)
            map.off('mouseenter', layerId, onMouseEnter)
            map.off('mouseleave', layerId, onMouseLeave)
          }
        } catch (e) { }
      })
      try {
        if (map.getStyle() && map.getLayer('clusters')) {
          map.off('click', 'clusters', onClusterClick)
          map.off('mouseenter', 'clusters', onMouseEnter)
          map.off('mouseleave', 'clusters', onMouseLeave)
        }
      } catch (e) { }

    }
  }, [map, isMapReady, onSiteClick, sourceId])

  const getDeathCauseData = (cause?: string) => {
    return ICONS.deathCause[cause as keyof typeof ICONS.deathCause] || ICONS.deathCause.default
  }


  return (
    <>
      {role === 'superadmin' && ( // Was institutional
        <div className="flex md:hidden items-center justify-center backdrop-blur-sm text-center text-sm uppercase font-ibm-plex-mono absolute inset-0 bg-[#00e]/70 text-white z-50">
          Perdón =(
          <br /><br />
          Sólo me dió el ⌛ para hacerlo en desktop.
        </div>
      )}
      {map && (
        <>
          {(currentZoom >= 10 ? visibleSites : (selectedSite ? [selectedSite] : []))
            .map((site, index) => {
              const name = site.title
              const death_cause = site.insights?.memorial?.death_cause
              const kind = (site as any).kind || 'animita'
              const slug = site.slug || site.id

              const deathCauseData = getDeathCauseData(death_cause)
              const isVisible = currentZoom >= 10
              const href = `/${kind.toLowerCase()}/${slug}`

              // Calculate text scale based on zoom (0.7 at zoom 10, 1.0 at zoom 18)
              const textScale = Math.min(1, Math.max(0.7, 0.7 + ((currentZoom - 10) / 8) * 0.3))

              // Calculate top position based on zoom (capped to prevent overflow at extreme zoom)
              const effectiveZoom = Math.min(currentZoom, 22)
              const topValue = 38 + ((effectiveZoom - 10) * 1.25)

              const isActive = activeId === site.id

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
                        "transition-all duration-200 ease-out origin-top-left",
                        isActive ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                      )}
                    >
                      <Link
                        href={href}
                        prefetch={false}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-50 flex flex-col items-center gap-2"
                        // eslint-disable-next-line react/forbid-dom-props
                        style={{
                          top: `${topValue}px`,
                        }}
                      >
                        <span className="font-ibm-plex-mono uppercase text-sm font-medium text-black">
                          {name || 'Animita'}
                        </span>
                        <Button size="sm" variant="link" className="text-black shadow-lg text-xs h-7 px-3 rounded-full hover:underline group-hover:underline flex items-center gap-1 transition-all">
                          Ver detalles
                          <ArrowUpRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </MapMarker>
              )
            })}
        </>
      )}
    </>
  )
}
