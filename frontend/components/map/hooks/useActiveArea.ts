import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { COLORS } from '@/lib/map-style'

interface UseActiveAreaProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  activeArea: any
}

export function useActiveArea({ map, isMapReady, activeArea }: UseActiveAreaProps) {
  useEffect(() => {
    if (!map || !isMapReady) return

    const sourceId = 'active-area-source'
    const layerIdFill = 'active-area-fill'
    const layerIdLine = 'active-area-line'

    // Cleanup function to remove layers/source
    const cleanup = () => {
      if (map.getLayer(layerIdFill)) map.removeLayer(layerIdFill)
      if (map.getLayer(layerIdLine)) map.removeLayer(layerIdLine)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }

    if (!activeArea) {
      cleanup()
      return
    }

    // Add source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: activeArea
      })
    } else {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(activeArea)
    }

    // Add layers
    // Only add fill layer, no outline/box
    if (!map.getLayer(layerIdFill)) {
      map.addLayer({
        id: layerIdFill,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': COLORS.searchElements,
          'fill-opacity': 0.2
        },
        filter: ['!', ['==', ['get', 'isBbox'], true]]
      })
    } else {
      const isBbox = activeArea.properties?.isBbox;
    }

    // Add line layer for LineString/MultiLineString/Polygon Outline
    if (!map.getLayer(layerIdLine)) {
      map.addLayer({
        id: layerIdLine,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': COLORS.searchElements,
          'line-width': 0,
          'line-opacity': 0.8
        },
        filter: ['!', ['==', ['get', 'isBbox'], true]]
      })
    }

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds()

    const extendBounds = (geometry: any) => {
      if (geometry.type === 'Point') {
        bounds.extend(geometry.coordinates)
      } else if (geometry.type === 'Polygon') {
        geometry.coordinates[0].forEach((coord: any) => bounds.extend(coord))
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((poly: any) => {
          poly[0].forEach((coord: any) => bounds.extend(coord))
        })
      } else if (geometry.type === 'LineString') {
        geometry.coordinates.forEach((coord: any) => bounds.extend(coord))
      }
    }

    if (activeArea.type === 'FeatureCollection') {
      activeArea.features.forEach((f: any) => extendBounds(f.geometry))
    } else {
      extendBounds(activeArea.geometry)
    }

    if (!bounds.isEmpty()) {
      // Delay fitting bounds to avoid jarring jump if loading
      setTimeout(() => {
        if (map) {
          map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 1000, essential: true })
        }
      }, 100)
    }

  }, [activeArea, isMapReady, map])
}
