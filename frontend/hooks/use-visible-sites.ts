import { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { Animita } from '@/types/animita'

interface UseVisibleSitesProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  currentZoom: number
  zoomThreshold: number
  animitas: Animita[]
  maxVisibleSites?: number
}

export function useVisibleSites({
  map,
  isMapReady,
  currentZoom,
  zoomThreshold,
  animitas,
  maxVisibleSites = 20
}: UseVisibleSitesProps) {
  const [visibleSites, setVisibleSites] = useState<Animita[]>([])

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

        const sites = animitas
          .filter((s: Animita) => visibleIds.has(s.id))
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
  }, [isMapReady, animitas, map, zoomThreshold, maxVisibleSites])

  return visibleSites
}
