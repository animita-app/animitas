import { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/mock'

interface UseVisibleSitesProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  currentZoom: number
  zoomThreshold: number
  filteredData: HeritageSite[]
  maxVisibleSites?: number
}

export function useVisibleSites({
  map,
  isMapReady,
  currentZoom,
  zoomThreshold,
  filteredData,
  maxVisibleSites = 20
}: UseVisibleSitesProps) {
  const [visibleSites, setVisibleSites] = useState<HeritageSite[]>([])

  useEffect(() => {
    if (!map || !isMapReady) return

    const updateVisible = () => {
      const zoom = map.getZoom()
      if (zoom >= zoomThreshold) {
        // Query rendered features to see what's on screen
        const layersToQuery = [
          'memorials-inner',
          'memorials-outer',
          'memorials-marker-default',
          'memorials-marker-image'
        ].filter(id => map.getLayer(id))

        if (layersToQuery.length === 0) {
          setVisibleSites([])
          return
        }
        const features = map.queryRenderedFeatures({ layers: layersToQuery })

        // Extract IDs
        const visibleIds = new Set(features.map(f => f.properties?.id).filter(Boolean))

        // Find full site objects and limit to preserve performance
        const sites = filteredData
          .filter((s: HeritageSite) => visibleIds.has(s.id))
          .slice(0, maxVisibleSites)

        setVisibleSites(sites)
      } else {
        setVisibleSites([])
      }
    }

    map.on('moveend', updateVisible)
    map.on('zoomend', updateVisible)
    // Run once
    updateVisible()

    return () => {
      map.off('moveend', updateVisible)
      map.off('zoomend', updateVisible)
    }
  }, [isMapReady, filteredData, map, currentZoom, zoomThreshold, maxVisibleSites])

  return visibleSites
}
