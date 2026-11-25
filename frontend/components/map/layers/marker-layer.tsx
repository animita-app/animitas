'use client'

import { animitaHref } from '@/lib/routes'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Animita } from '@/types/animita'
import { MapMarker } from '../map-marker'
import { CutoutText } from '@/components/cutout-text'
import { cn } from '@/lib/utils'

// Mapbox can't read CSS variables. Stamp-pad blue: the app's accent, a little faded by the paper.
const STAMP_INK = '#26318f'
const RING = 'stamp-ring'
const MARK = 'stamp-mark'

// Rubber-stamp marks drawn once on a canvas: the ink takes unevenly, with a lighter arc where the stamp
// rocked and specks where the pad was dry. Vector on purpose, so the map contrasts with the photos.
function stamp(size: number, dot: boolean) {
  const ratio = 2
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size * ratio
  const ctx = canvas.getContext('2d')!
  const c = (size * ratio) / 2
  ctx.strokeStyle = ctx.fillStyle = STAMP_INK
  ctx.lineWidth = 2.6 * ratio
  ctx.beginPath()
  ctx.arc(c, c, c - ctx.lineWidth, 0, Math.PI * 2)
  ctx.stroke()
  if (dot) {
    ctx.beginPath()
    ctx.arc(c, c, c * 0.32, 0, Math.PI * 2)
    ctx.fill()
  }
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const px = image.data
  const rock = Math.random() * Math.PI * 2
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue
    const x = (i / 4) % canvas.width - c
    const y = Math.floor(i / 4 / canvas.width) - c
    const angle = Math.atan2(y, x)
    const pressure = 0.62 + 0.38 * Math.cos(angle - rock)
    const speck = Math.random()
    px[i + 3] = speck < 0.07 ? 0 : Math.round(px[i + 3] * pressure * (0.7 + 0.3 * speck))
  }
  return { width: canvas.width, height: canvas.height, data: new Uint8Array(px.buffer) }
}

function addStamps(map: mapboxgl.Map) {
  if (!map.hasImage(RING)) map.addImage(RING, stamp(56, false), { pixelRatio: 2 })
  if (!map.hasImage(MARK)) map.addImage(MARK, stamp(28, true), { pixelRatio: 2 })
}

export interface MarkerLayerProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  data: any[]
  onSiteClick?: (id: string, feature: mapboxgl.MapboxGeoJSONFeature) => void
  sourceId?: string
  currentZoom: number
  visibleSites: Animita[]
  selectedSite: Animita | null
  onSiteSelect?: (site: Animita | null) => void
}

const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 20,
  clusterRadius: 25,
}

const POINT_FILTER = ['!', ['has', 'point_count']] as any

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
  const [layersReady, setLayersReady] = useState(false)
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

    addStamps(map)
    const tilt = ['*', ['-', ['%', ['coalesce', ['get', 'point_count'], ['length', ['to-string', ['get', 'title']]]], 9], 4], 4]

    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'icon-image': RING,
          'icon-allow-overlap': true,
          'icon-rotate': tilt as any,
          'icon-size': ['step', ['get', 'point_count'], 0.75, 10, 1, 30, 1.3],
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': ['step', ['get', 'point_count'], 13, 10, 15, 30, 18],
          'text-rotate': tilt as any,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': STAMP_INK, 'text-opacity': 0.85 },
      })
    }

    if (!map.getLayer(`${sourceId}-inner`)) {
      map.addLayer({
        id: `${sourceId}-inner`,
        type: 'symbol',
        source: sourceId,
        filter: POINT_FILTER,
        layout: {
          'icon-image': MARK,
          'icon-allow-overlap': true,
          'icon-rotate': tilt as any,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 3, 0.75, 10, 1, 16, 1.4],
        },
      })
    }
    setLayersReady(true)

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
        properties: site,
      })),
    } as any)
  }, [map, isMapReady, data, sourceId])

  // 4. Handle events
  useEffect(() => {
    if (!map || !isMapReady) return

    if (!layersReady) return
    const layersToClick = [`${sourceId}-inner`]

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
  }, [map, isMapReady, layersReady, onSiteClick, sourceId, cancelClose, scheduleClose])

  const sitesToRender = currentZoom >= 10 ? visibleSites : (selectedSite ? [selectedSite] : [])

  return (
    <>
      {map && sitesToRender.map(site => {
        if (!site.location) return null
        const href = animitaHref(site.slug || site.id)
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
                  aria-label={site.title || 'Animita'}
                  className="absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
                  style={{ top: `${topValue}px` }}
                >
                  <span className="flex w-max max-w-72 flex-wrap justify-center gap-x-2 gap-y-1">
                    {(site.title || 'animita').split(/\s+/).map((word, i) => (
                      <CutoutText key={`${word}-${i}`} text={word} height={18} />
                    ))}
                  </span>
                </Link>
              </div>
            </div>
          </MapMarker>
        )
      })}
    </>
  )
}
