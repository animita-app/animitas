'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FeatureCollection, Point } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  accessToken: string
  style?: string
}

const CHILE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-75.6, -56.0],
  [-66.4, -17.5]
]

const CHILE_SAFE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-180.0, -85.0],
  [-30.0, 40.0]
]

const EMPTY_MEMORIALS: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: []
}

export default function MapboxMap({ accessToken, style }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [memorials, setMemorials] = useState<FeatureCollection<Point>>(EMPTY_MEMORIALS)
  const router = useRouter()

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style ?? 'mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7',
      center: [-71.0, -36.0],
      zoom: 3,
      attributionControl: false,
      maxBounds: CHILE_SAFE_BOUNDS
    })

    map.current.on('load', () => {
      const mapInstance = map.current!
      mapInstance.fitBounds(CHILE_BOUNDS, { padding: 64, duration: 0 })

      const currentZoom = mapInstance.getZoom()
      mapInstance.setMinZoom(currentZoom)
      mapInstance.setMaxZoom(currentZoom + 3)

      if (!mapInstance.getSource('memorials')) {
        mapInstance.addSource('memorials', {
          type: 'geojson',
          data: EMPTY_MEMORIALS
        })
      }

      if (!mapInstance.getLayer('memorials-outer')) {
        mapInstance.addLayer({
          id: 'memorials-outer',
          type: 'circle',
          source: 'memorials',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3,
              8,
              6,
              18
            ],
            'circle-color': '#f5f5f5',
            'circle-opacity': 0.85,
            'circle-stroke-color': '#111111',
            'circle-stroke-width': 1.5
          }
        })
      }

      if (!mapInstance.getLayer('memorials-inner')) {
        mapInstance.addLayer({
          id: 'memorials-inner',
          type: 'circle',
          source: 'memorials',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3,
              2.5,
              6,
              6
            ],
            'circle-color': '#111111',
            'circle-opacity': 0.92
          }
        })
      }

      const handleClick = (event: mapboxgl.MapLayerMouseEvent) => {
        const feature = event.features?.[0]
        const id = feature?.properties?.id
        if (typeof id === 'string') {
          router.push(`/memorial/${id}`)
        }
      }

      const handleEnter = () => {
        mapInstance.getCanvas().style.cursor = 'pointer'
      }

      const handleLeave = () => {
        mapInstance.getCanvas().style.cursor = ''
      }

      mapInstance.on('click', 'memorials-outer', handleClick)
      mapInstance.on('click', 'memorials-inner', handleClick)
      mapInstance.on('mouseenter', 'memorials-outer', handleEnter)
      mapInstance.on('mouseenter', 'memorials-inner', handleEnter)
      mapInstance.on('mouseleave', 'memorials-outer', handleLeave)
      mapInstance.on('mouseleave', 'memorials-inner', handleLeave)

      mapInstance.once('remove', () => {
        mapInstance.off('click', 'memorials-outer', handleClick)
        mapInstance.off('click', 'memorials-inner', handleClick)
        mapInstance.off('mouseenter', 'memorials-outer', handleEnter)
        mapInstance.off('mouseenter', 'memorials-inner', handleEnter)
        mapInstance.off('mouseleave', 'memorials-outer', handleLeave)
        mapInstance.off('mouseleave', 'memorials-inner', handleLeave)
      })
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [accessToken, style, router])

  useEffect(() => {
    let cancelled = false

    const fetchMemorials = async () => {
      try {
        const response = await fetch('/api/memorials')
        if (!response.ok) throw new Error(`Error ${response.status}`)

        const payload: {
          memorials: Array<{ id: string; name: string; coordinates: [number, number] }>
        } = await response.json()

        if (cancelled) return

        const geojson: FeatureCollection<Point> = {
          type: 'FeatureCollection',
          features: payload.memorials.map((memorial) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: memorial.coordinates
            },
            properties: {
              id: memorial.id,
              name: memorial.name
            }
          }))
        }

        setMemorials(geojson)
      } catch (error) {
        console.error('No se pudieron cargar las animitas', error)
      }
    }

    fetchMemorials()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!map.current) return
    const source = map.current.getSource('memorials') as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(memorials)
    }
  }, [memorials])

  return <div ref={mapContainer} className="h-full w-full min-h-[400px]" />
}
