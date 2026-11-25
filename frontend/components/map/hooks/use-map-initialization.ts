import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { applyPaperStyle } from '../paper-style'

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
      pitch: 0, // Ensure map starts flat
      bearing: 0, // Ensure map starts with no rotation
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false
    })

    map.current.on('load', () => {
      const mapInstance = map.current!
      applyPaperStyle(mapInstance)
      setIsMapReady(true)
      mapInstance.touchZoomRotate.disableRotation()
      mapInstance.fitBounds(CHILE_BOUNDS, { padding: { top: 96, bottom: 48, left: 64, right: 64 }, duration: 0 })

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
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [accessToken, style])

  return { mapContainer, map, isMapReady }
}
