import { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/heritage'

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
        const layersToQuery = [
          'memorials-inner',
          'memorials-outer'
        ].filter(id => map.getLayer(id))

        if (layersToQuery.length === 0) {
          return
        }

        const features = map.queryRenderedFeatures({ layers: layersToQuery })
        const visibleIds = new Set(features.map(f => f.properties?.id).filter(Boolean))

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
    updateVisible()

    return () => {
      map.off('moveend', updateVisible)
      map.off('zoomend', updateVisible)
    }
  }, [isMapReady, filteredData, map, zoomThreshold, maxVisibleSites])

  return visibleSites
}
