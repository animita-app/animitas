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

    // Create marker
    markerRef.current = new mapboxgl.Marker({
      element: container,
      anchor: 'bottom', // Ensure bottom anchor for pins
    })
      .setLngLat(coordinates)

    // Safety check before adding
    try {
      markerRef.current.addTo(map)
    } catch (e) {
      console.warn("Failed to add component marker to map", e)
    }

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
    }
  }, [map, coordinates]) // Re-run if map or coords change, container])

  useEffect(() => {
    markerRef.current?.setLngLat(coordinates)
  }, [coordinates])

  return createPortal(
    <div className="relative group cursor-pointer">
      {/* Visual Marker (Image or Default) */}
      {children}
    </div>,
    container
  )
}
