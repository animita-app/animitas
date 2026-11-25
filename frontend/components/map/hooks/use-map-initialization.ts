import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { applyPaperStyle } from '../paper-style'

export const CHILE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-75.6, -56.0],
  [-66.4, -17.5]
]

// Room for the road sign on top and the shelf of objects below, so the whole country sits between them.
export const CHILE_PADDING = { top: 96, bottom: 128, left: 48, right: 48 }

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
      // Starts framed on Chile, so the first paint is already the view instead of a jump into it.
      bounds: CHILE_BOUNDS,
      fitBoundsOptions: { padding: CHILE_PADDING },
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
      // Shown once repainted on paper, so the base style's grays never flash.
      mapInstance.once('idle', () => mapInstance.getContainer().classList.add('map-shown'))
      mapInstance.touchZoomRotate.disableRotation()

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
