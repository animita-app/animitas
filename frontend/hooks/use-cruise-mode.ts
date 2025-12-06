import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/mock'

interface UseCruiseModeProps {
  map: mapboxgl.Map | null
  sites: HeritageSite[]
  onSiteExamine?: (site: HeritageSite) => void
}

export function useCruiseMode({ map, sites, onSiteExamine }: UseCruiseModeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [activeSite, setActiveSite] = useState<HeritageSite | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Sort sites North to South (Latitude Descending)
  // Latitude goes from +90 (North) to -90 (South). So higher lat is more North.
  const sortedSites = useMemo(() => {
    return [...sites].sort((a, b) => b.location.lat - a.location.lat)
  }, [sites])

  const stopCruise = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev) return prev; // Avoid update if already false
      return false;
    })
    setCurrentIndex(-1)
    setActiveSite(null)
    if (timerRef.current) clearTimeout(timerRef.current)

    // Reset map pitch/bearing if desired
    if (map) {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      })
    }
  }, [map])

  const startCruise = useCallback(() => {
    if (!map || sortedSites.length === 0) return
    setIsPlaying(true)
    setCurrentIndex(-1)
    flyToNextSite(-1)
  }, [map, sortedSites]) // eslint-disable-line react-hooks/exhaustive-deps

  const flyToNextSite = (prevIndex: number) => {
    if (!map) return

    const nextIndex = prevIndex + 1
    if (nextIndex >= sortedSites.length) {
      // Loop or stop? Let's stop for now.
      stopCruise()
      return
    }

    setCurrentIndex(nextIndex)
    const site = sortedSites[nextIndex]
    setActiveSite(site)

    // Notify parent to maybe show a popup or highlight
    if (onSiteExamine) onSiteExamine(site)

    // Fly configuration for cinematic effect
    map.flyTo({
      center: [site.location.lng, site.location.lat],
      zoom: 17,
      pitch: 60, // Tilt for 3D effect
      bearing: Math.random() * 30 - 15, // Slight random rotation
      speed: 0.8, // Faster flight
      curve: 1.2,
      essential: true
    })

    // Wait for arrival + examine time before moving to next
    // To detect exact "moveend" is tricky if user interrupts, but for auto-mode:
    // We can just listen to 'moveend' ONCE.
    map.once('moveend', () => {
      if (!isPlaying) return // Check if stopped during flight

      // Wait 3 seconds at the site (faster pace)
      timerRef.current = setTimeout(() => {
        flyToNextSite(nextIndex)
      }, 3000)
    })
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return {
    isCruiseActive: isPlaying,
    activeCruiseSite: activeSite,
    startCruise,
    stopCruise
  }
}
