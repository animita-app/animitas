'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { COLORS } from '@/lib/map-style'
import { HeritageSite } from '@/types/heritage'
import { MapMarker } from '../map-marker'
import { MapPin } from 'lucide-react'
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


  const sitesToRender = visibleSites
  const isZoomedIn = currentZoom >= 8

  // Simple clustering for zoomed-out view
  const clusteredSites = useMemo(() => {
    if (isZoomedIn || !map) return sitesToRender.map(s => ({ sites: [s], center: s.location }))

    const clusters: { sites: typeof visibleSites; center: { lat: number; lng: number } }[] = []
    const clusterRadius = 10 / Math.pow(2, currentZoom) // Adaptive cluster radius based on zoom
    const processed = new Set<string>()

    sitesToRender.forEach(site => {
      if (processed.has(site.id)) return

      const cluster = [site]
      processed.add(site.id)

      sitesToRender.forEach(other => {
        if (processed.has(other.id)) return
        const distance = Math.sqrt(
          Math.pow(site.location.lat - other.location.lat, 2) +
          Math.pow(site.location.lng - other.location.lng, 2)
        )
        if (distance < clusterRadius) {
          cluster.push(other)
          processed.add(other.id)
        }
      })

      const centerLat = cluster.reduce((sum, s) => sum + s.location.lat, 0) / cluster.length
      const centerLng = cluster.reduce((sum, s) => sum + s.location.lng, 0) / cluster.length
      clusters.push({ sites: cluster, center: { lat: centerLat, lng: centerLng } })
    })

    return clusters
  }, [sitesToRender, isZoomedIn, currentZoom, map])

  useEffect(() => {
    console.log('[MarkerLayer] Zoom:', { currentZoom, isZoomedIn, sitesCount: sitesToRender.length, clusters: clusteredSites.length })
  }, [currentZoom, isZoomedIn, sitesToRender.length, clusteredSites.length])

  return (
    <>
      {map && clusteredSites.map((cluster, idx) => {
        const clusterSize = cluster.sites.length
        const isSingleSite = clusterSize === 1
        const site = cluster.sites[0]
        const kind = (site as any).kind || 'animita'
        const href = `/${kind.toLowerCase()}/${site.slug || site.id}`

        // Calculate size based on cluster count and zoom level
        const baseSize = Math.max(8, 20 + (currentZoom - 5) * 6.5) // Scales with zoom
        const sizeMultiplier = Math.min(Math.sqrt(clusterSize), 4) // Max 4x size
        const zoomMultiplier = isSingleSite ? Math.max(1, 1 + (currentZoom - 8) * 0.35) : 1
        const clusterSize_px = baseSize * sizeMultiplier * zoomMultiplier
        const imageSize = baseSize * 1.3 // Scales with zoom for smooth transitions
        const fontSize = clusterSize_px * 0.5

        if (isSingleSite) {
          console.log(`[Marker] zoom=${currentZoom}, baseSize=${baseSize.toFixed(1)}, zoomMult=${zoomMultiplier.toFixed(2)}, clusterSize_px=${clusterSize_px.toFixed(1)}, imageSize=${imageSize.toFixed(1)}`)
        }

        return (
          <MapMarker
            key={`cluster-${idx}`}
            map={map}
            coordinates={[cluster.center.lng, cluster.center.lat]}
            className="z-20 transition-all duration-300"
          >
            {isZoomedIn && isSingleSite ? (
              <div
                className="flex flex-col items-center pointer-events-auto"
                onMouseEnter={() => { cancelClose(); setActiveId(site.id); }}
                onMouseLeave={scheduleClose}
                onClick={() => {
                  cancelClose()
                  setActiveId(site.id)
                  setLockedId(site.id)
                  if (onSiteClick) {
                    onSiteClick(site.id, { properties: { id: site.id }, geometry: { type: 'Point', coordinates: [site.location.lng, site.location.lat] } } as any)
                  }
                }}
              >
                <Link
                  href={href}
                  prefetch={false}
                  className="relative flex pb-2 flex-col items-center justify-center transition-all ease-out scale-100 drop-shadow-md hover:scale-105"
                >
                  <div className="relative border-4 border-white shadow-md rounded-md">
                    {site.images && site.images.length > 0 ? (
                      <div className="overflow-hidden bg-muted rounded-sm" style={{ width: `${imageSize}px`, height: `${imageSize}px` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={site.images[0]}
                          alt={site.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-background rounded-sm" style={{ width: `${imageSize}px`, height: `${imageSize}px` }}>
                        <MapPin className="size-4" />
                      </div>
                    )}
                  </div>

                  <div
                    className="absolute top-full whitespace-nowrap font-semibold text-foreground"
                    style={{
                      fontSize: `${imageSize * 0.35}px`,
                      padding: `${imageSize * 0.15}px ${imageSize * 0.2}px`,
                      marginTop: `${imageSize * 0.15}px`,
                      textShadow: `
                        -1px -1px 0 white, 1px -1px 0 white,
                        -1px 1px 0 white, 1px 1px 0 white,
                        0 -1px 0 white, 0 1px 0 white,
                        -1px 0 0 white, 1px 0 0 white,
                        2px 2px 4px rgba(0,0,0,0.2)
                      `
                    }}
                  >
                    {site.title || 'Animita'}
                  </div>
                </Link>
              </div>
            ) : (
              <div
                className="rounded-full border-[1.5px] border-[#00e] cursor-pointer shadow-md flex items-center justify-center font-medium text-[#00e] transition-all"
                style={{ width: `${clusterSize_px}px`, height: `${clusterSize_px}px`, fontSize: `${fontSize}px` }}
              >
                {clusterSize === 1 ? <div className="rounded-full bg-[#00e] w-1 h-1" /> : clusterSize}
              </div>
            )}
          </MapMarker>
        )
      })}
    </>
  )
}
