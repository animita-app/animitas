import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import { cn } from '@/lib/utils'

interface MapMarkerProps {
  map: mapboxgl.Map
  coordinates: [number, number]
  children: React.ReactNode
  className?: string
}

export const MapMarker = ({ map, coordinates, children, className }: MapMarkerProps) => {
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
      element: container, // Use the container state
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
  }, [map, coordinates[0], coordinates[1]]) // Re-run only if map or coords values change

  useEffect(() => {
    markerRef.current?.setLngLat(coordinates)
  }, [coordinates[0], coordinates[1]])

  return createPortal(
    <div className={cn("relative group cursor-pointer", className)}>
      {/* Visual Marker (Image or Default) */}
      {children}
    </div>,
    container
  )
}
