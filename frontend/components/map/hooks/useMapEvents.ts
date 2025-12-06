import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CHILE_BOUNDS } from './useMapInitialization'

const PROFILE_ZOOM_THRESHOLD = 12
const TARGET_ZOOM = 17

interface UseMapEventsProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  focusedHeritageSiteId?: string | null
  onLayerClick?: (layerId: string, feature: any) => void
}

export function useMapEvents({ map, isMapReady, focusedHeritageSiteId, onLayerClick }: UseMapEventsProps) {
  const router = useRouter()
  const lastFocusedIdRef = useRef<string | null>(null)

  // Click Listeners
  useEffect(() => {
    if (!map || !isMapReady) return

    // map.getStyle() check removed as isMapReady (derived from 'load' event) is safer





    const onClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      const clusterId = feature.properties?.cluster_id

      const source = map.getSource('memorials') as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom === null || zoom === undefined) return
        // Use the exact zoom level where the cluster breaks apart
        map.flyTo({
          center: (feature.geometry as any).coordinates,
          zoom: zoom + 1, // Add buffer to ensure expansion
          speed: 1.2,
          curve: 1,
          essential: true,
          duration: 500
        })
      })
    }

    const onLayerFeatureClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      if (!feature.layer) return

      // Identify layer
      const layerId = feature.layer.id.replace(/-inner|-outer|-poly|-heatmap/, '')

      if (onLayerClick) {
        onLayerClick(layerId, feature)
      }
    }

    const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onMouseLeave = () => { map.getCanvas().style.cursor = '' }

    // Memorials


    // Clusters (handled in HeritageMarkerLayer)
    // map.on('click', 'clusters', onClusterClick)
    // map.on('mouseenter', 'clusters', onMouseEnter)
    // map.on('mouseleave', 'clusters', onMouseLeave)

    // Context Layers (Add listeners for all context layers)
    const contextLayers = [
      'churches', 'cemeteries', 'bars', 'hospitals', 'police', 'fire_station',
      'schools', 'universities', 'traffic_lights', 'highways', 'urban_streets', 'critical_points'
    ]

    contextLayers.forEach(layer => {
      const pointLayer = `${layer}-inner`
      const lineLayer = layer
      const polyLayer = `${layer}-poly`
      const heatmapLayer = `${layer}-heatmap`

      if (map.getLayer(pointLayer)) {
        map.on('click', pointLayer, onLayerFeatureClick)
        map.on('mouseenter', pointLayer, onMouseEnter)
        map.on('mouseleave', pointLayer, onMouseLeave)
      }
      if (map.getLayer(lineLayer)) { // For lines
        map.on('click', lineLayer, onLayerFeatureClick)
        map.on('mouseenter', lineLayer, onMouseEnter)
        map.on('mouseleave', lineLayer, onMouseLeave)
      }
      // Add others as needed
    })

    return () => {

      map.off('click', 'clusters', onClusterClick)
      // Cleanup others...
    }
  }, [map, isMapReady, onLayerClick])

  useEffect(() => {
    if (!map) return

    const onZoom = () => {
      // Logic removed to prevent reloading the map page on zoom out
      // if (map.getZoom() < 12 && focusedHeritageSiteId) {
      //   router.push('/')
      // }
    }

    map.on('zoom', onZoom)

    return () => {
      map.off('zoom', onZoom)
    }
  }, [map, focusedHeritageSiteId, router])

  const focusHeritageSite = useCallback(
    (
      heritageSiteId: string,
      coordinates: [number, number],
      options?: {
        shouldNavigate?: boolean
        instant?: boolean
      }
    ) => {
      const { shouldNavigate = true, instant = false } = options ?? {}
      if (!map) {
        return
      }

      if (shouldNavigate) {
        lastFocusedIdRef.current = heritageSiteId
      }

      const padding = { top: 0, bottom: 0, left: 0, right: 0 }

      map.resize()

      if (instant) {
        map.jumpTo({
          center: coordinates,
          zoom: TARGET_ZOOM,
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          padding
        })
      } else {
        const currentZoom = map.getZoom()
        const canViewProfile = currentZoom >= PROFILE_ZOOM_THRESHOLD

        if (!canViewProfile) {
          map.flyTo({
            center: coordinates,
            zoom: TARGET_ZOOM,
            speed: 4,
            curve: 1,
            padding,
            essential: true
          })
        } else {
          map.easeTo({
            center: coordinates,
            zoom: Math.max(currentZoom, TARGET_ZOOM - 1),
            duration: 150,
            bearing: map.getBearing(),
            pitch: map.getPitch(),
            padding,
            essential: true
          })
        }
      }
    },
    [map]
  )

  const resetView = useCallback(() => {
    if (!map) {
      console.warn('[useMapEvents] Map instance missing during resetView')
      return
    }

    const camera = map.cameraForBounds(CHILE_BOUNDS, {
      padding: { top: 48, bottom: 48, left: 48, right: 48 }
    })

    if (camera) {
      map.flyTo({
        ...camera,
        duration: 2000,
        essential: true
      })
    } else {
      console.warn('[useMapEvents] Could not calculate camera for bounds, falling back to fitBounds')
      map.fitBounds(CHILE_BOUNDS, {
        padding: 64,
        essential: true,
        duration: 2000
      })
    }
  }, [map])

  return { focusHeritageSite, resetView }
}
