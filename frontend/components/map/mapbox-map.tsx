'use client'

import { useEffect, useRef } from 'react'
import type { FeatureCollection, Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  accessToken: string
  style?: string
  center?: [number, number]
  zoom?: number
}

const CHILE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-75.6, -56.0],
  [-66.4, -17.5]
]

const CHILE_VIEWPORT_POLYGON: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-75.6, -56.0],
      [-66.4, -56.0],
      [-66.4, -17.5],
      [-75.6, -17.5],
      [-75.6, -56.0]
    ]
  ]
}

const CHILE_MASK_SOURCE: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90]
          ],
          [
            [-75.6, -56.0],
            [-75.6, -17.5],
            [-66.4, -17.5],
            [-66.4, -56.0],
            [-75.6, -56.0]
          ]
        ]
      }
    }
  ]
}

export default function MapboxMap({
  accessToken,
  style = 'mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7',
  center = [-71.5429, -35.6751],
  zoom = 6
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center,
      zoom,
      attributionControl: false,
      maxBounds: [
        [-75.6, -56.0],
        [-66.4, -17.5]
      ] as [[number, number], [number, number]],
      minZoom: 0,
      maxZoom: 12
    })

    map.current.on('load', () => {
      if (map.current) {
        const mapInstance = map.current
        mapInstance.resize()
        mapInstance.fitBounds(CHILE_BOUNDS, {
          padding: { top: 80, bottom: 40, left: 20, right: 20 },
          duration: 0
        })

        if (!mapInstance.getSource('chile-mask')) {
          mapInstance.addSource('chile-mask', {
            type: 'geojson',
            data: CHILE_MASK_SOURCE
          })
        }

        if (!mapInstance.getLayer('chile-mask-fill')) {
          mapInstance.addLayer({
            id: 'chile-mask-fill',
            type: 'fill',
            source: 'chile-mask',
            paint: {
              'fill-color': '#f8f9fa',
              'fill-opacity': 1
            }
          })
        }

        const withinChileFilter = ['within', ['literal', CHILE_VIEWPORT_POLYGON]] as any
        const layers = mapInstance.getStyle().layers

        layers.forEach((layer) => {
          const { id: layerId, type: layerType } = layer

          if (!mapInstance.getLayer(layerId)) return

          if (layerType !== 'background' && layerId !== 'chile-mask-fill') {
            const currentFilters = mapInstance.getFilter(layerId)

            if (layerId.includes('road')) {
              const chileFilter = ['match', ['get', 'iso_3166_1'], ['CL'], true, false]
              const combinedFilter = currentFilters
                ? ['all', currentFilters, chileFilter, withinChileFilter]
                : ['all', chileFilter, withinChileFilter]
              mapInstance.setFilter(layerId, combinedFilter as any)
            } else if (
              layerId.includes('settlement') ||
              layerId.includes('place-label') ||
              layerId.includes('poi-label')
            ) {
              const combinedFilter = currentFilters
                ? ['all', currentFilters, ['match', ['get', 'iso_3166_1'], ['CL'], true, false]]
                : ['match', ['get', 'iso_3166_1'], ['CL'], true, false]
              mapInstance.setFilter(layerId, ['all', combinedFilter, withinChileFilter] as any)
            } else if (layerId.includes('admin')) {
              const combinedFilter = currentFilters
                ? ['all', currentFilters, withinChileFilter]
                : withinChileFilter
              mapInstance.setFilter(layerId, combinedFilter as any)
            }
          }

          if (layerId.includes('shield') || layerId.includes('road-number') || layerId.includes('route-shield')) {
            mapInstance.setLayoutProperty(layerId, 'visibility', 'none')
          }

          if (layerId.includes('settlement-major-label') || layerId.includes('place-city')) {
            mapInstance.setLayoutProperty(layerId, 'minzoom', 4)
          } else if (layerId.includes('settlement-minor-label')) {
            mapInstance.setLayoutProperty(layerId, 'minzoom', 7)
          }
        })
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [accessToken, style, center, zoom])

  return (
    <div
      ref={mapContainer}
      className="h-full w-full min-h-[400px]"
    />
  )
}
