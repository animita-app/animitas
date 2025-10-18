'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  accessToken: string
  style?: string
}

// Rectángulo exacto de Chile
const CHILE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-75.6, -56.0], // SW
  [-66.4, -17.5]  // NE
]

// Safe area mucho más grande para Chile (horizontal y vertical)
// Safe area ~1.5x más grande que antes
const CHILE_SAFE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-180.0, -85.0], // SW: extremo oeste y sur dentro de límites válidos
  [-30.0, 40.0]    // NE: extremo este y norte dentro de límites válidos
]

export default function MapboxMap({ accessToken, style }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style ?? 'mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7',
      center: [-71.0, -36.0], // centro aproximado de Chile
      zoom: 3,              // alejado para ver Chile completo
      attributionControl: false,
      maxBounds: CHILE_SAFE_BOUNDS
    })

    map.current.on('load', () => {
      const mapInstance = map.current!

      // Ajusta la vista inicial para que Chile llene la pantalla
      mapInstance.fitBounds(CHILE_BOUNDS, { padding: 64, duration: 0 })

      // Fijar zoom mínimo = Chile completo, máximo = acercarse un poco
      const currentZoom = mapInstance.getZoom()
      mapInstance.setMinZoom(currentZoom)
      mapInstance.setMaxZoom(currentZoom + 3)
    })

    return () => { map.current?.remove(); map.current = null }
  }, [accessToken, style])

  return <div ref={mapContainer} className="h-full w-full min-h-[400px]" />
}
