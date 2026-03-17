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
    div.className = 'pointer-events-none'
    div.style.width = '0'
    div.style.height = '0'
    return div
  })
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const lng = coordinates[0]
  const lat = coordinates[1]

  useEffect(() => {
    if (!map) return

    markerRef.current = new mapboxgl.Marker({
      element: container,
      anchor: 'bottom',
    })
      .setLngLat(coordinates)

    try {
      markerRef.current.addTo(map)
    } catch (e) {
    }

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, container, lng, lat])

  useEffect(() => {
    markerRef.current?.setLngLat(coordinates)
  }, [coordinates, lng, lat])

  return createPortal(
    <div className={cn("relative group cursor-pointer", className)}>
      {/* Visual Marker (Image or Default) */}
      {children}
    </div>,
    container
  )
}
