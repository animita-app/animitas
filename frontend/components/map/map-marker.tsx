import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'

interface MapMarkerProps {
  map: mapboxgl.Map
  coordinates: [number, number]
  children: React.ReactNode
}

export const MapMarker = ({ map, coordinates, children }: MapMarkerProps) => {
  const [container] = useState(() => {
    const div = document.createElement('div')
    // Use a generic class and ensure it doesn't block pointer events
    div.className = 'pointer-events-none'
    div.style.width = '0'
    div.style.height = '0'
    return div
  })
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!map) return

    markerRef.current = new mapboxgl.Marker({
      element: container,
      anchor: 'center'
    })
      .setLngLat(coordinates)
      .addTo(map)



    return () => {
      markerRef.current?.remove()
    }
  }, [map, container])

  useEffect(() => {
    markerRef.current?.setLngLat(coordinates)
  }, [coordinates])

  return createPortal(children, container)
}
