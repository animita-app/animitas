import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { COLORS } from '@/lib/map-style'

export const CHILE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-75.6, -56.0],
  [-66.4, -17.5]
]



interface UseMapInitializationProps {
  accessToken: string
  style?: string
}

export function useMapInitialization({ accessToken, style }: UseMapInitializationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      accessToken,
      style: style || 'mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7',
      center: [-71.0, -36.0],
      zoom: 3,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false
    })

    map.current.on('load', () => {
      const mapInstance = map.current!
      setIsMapReady(true)
      mapInstance.touchZoomRotate.disableRotation()
      mapInstance.fitBounds(CHILE_BOUNDS, { padding: 64, duration: 0 })

      const currentZoom = mapInstance.getZoom()
      const bounds = mapInstance.getBounds()

      mapInstance.setMinZoom(currentZoom)
      if (bounds) {
        const padding = 20 // degrees
        const extendedBounds = new mapboxgl.LngLatBounds(
          [bounds.getWest() - padding, bounds.getSouth() - padding],
          [bounds.getEast() + padding, bounds.getNorth() + padding]
        )
        mapInstance.setMaxBounds(extendedBounds)
      }
      mapInstance.setMaxZoom(22)

      // Load default marker image for 'marker-15'
      if (!mapInstance.hasImage('marker-15')) {
        mapInstance.loadImage(
          'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
          (error, image) => {
            if (error) {
              console.warn('Could not load marker-15 image', error)
              return
            }
            if (image && !mapInstance.hasImage('marker-15')) {
              mapInstance.addImage('marker-15', image)
            }
          }
        )
      }



      // --- Overpass Sources ---
      const contextSources = [
        'churches', 'cemeteries', 'bars',
        'highways', 'urban_streets', 'traffic_lights',
        'hospitals', 'police', 'fire_station', 'schools', 'universities',
        'critical_points'
      ]

      contextSources.forEach(source => {
        if (!mapInstance.getSource(source)) {
          mapInstance.addSource(source, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        }
      })

      // --- Overpass Layers ---
      // Helper to add point layers (inner/outer circles)
      const addPointLayer = (id: string, color: string) => {
        if (mapInstance.getLayer(`${id}-outer`)) return
        mapInstance.addLayer({
          id: `${id}-outer`,
          type: 'circle',
          source: id,
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': 5,
            'circle-color': 'transparent',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': color
          }
        })
        mapInstance.addLayer({
          id: `${id}-inner`,
          type: 'circle',
          source: id,
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': 2,
            'circle-color': color
          }
        })
      }

      // Helper to add line layers
      const addLineLayer = (id: string, color: string, width: number = 2) => {
        if (mapInstance.getLayer(id)) return
        mapInstance.addLayer({
          id: id,
          type: 'line',
          source: id,
          layout: { visibility: 'none' },
          paint: {
            'line-color': color,
            'line-width': width
          }
        })
      }

      // Helper to add polygon layers
      const addPolygonLayer = (id: string, color: string) => {
        if (mapInstance.getLayer(`${id}-poly`)) return
        mapInstance.addLayer({
          id: `${id}-poly`,
          type: 'fill',
          source: id,
          layout: { visibility: 'none' },
          paint: {
            'fill-color': color,
            'fill-opacity': 0.2,
            'fill-outline-color': color
          },
          filter: ['==', '$type', 'Polygon']
        })
      }

      // Sociabilidad
      addPointLayer('churches', COLORS.context.churches)
      addPolygonLayer('churches', COLORS.context.churches)
      addPointLayer('bars', COLORS.context.bars)
      addPolygonLayer('bars', COLORS.context.bars)
      addPointLayer('schools', COLORS.context.schools)
      addPolygonLayer('schools', COLORS.context.schools)
      addPointLayer('universities', COLORS.context.universities)
      addPolygonLayer('universities', COLORS.context.universities)

      // Servicios
      addPointLayer('cemeteries', COLORS.context.cemeteries)
      addPolygonLayer('cemeteries', COLORS.context.cemeteries)
      addPointLayer('hospitals', COLORS.context.hospitals)
      addPolygonLayer('hospitals', COLORS.context.hospitals)
      addPointLayer('police', COLORS.context.police)
      addPolygonLayer('police', COLORS.context.police)
      addPointLayer('fire_station', COLORS.context.fire_station)
      addPolygonLayer('fire_station', COLORS.context.fire_station)

      // Transporte (Points)
      addPointLayer('traffic_lights', COLORS.context.traffic_lights)

      // Transporte (Lines)
      addLineLayer('highways', COLORS.context.highways, 3)
      addLineLayer('urban_streets', COLORS.context.urban_streets, 1)

      // Critical Points Heatmap
      if (!mapInstance.getLayer('critical_points-heatmap')) {
        mapInstance.addLayer({
          id: 'critical_points-heatmap',
          type: 'heatmap',
          source: 'critical_points',
          layout: { visibility: 'none' },
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'weight'],
              0, 0,
              10, 1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              15, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 20
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 1,
              18, 0.5
            ]
          }
        })
      }

    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [accessToken, style])

  return { mapContainer, map, isMapReady }
}
