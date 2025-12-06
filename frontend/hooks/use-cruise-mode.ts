import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/mock'

interface UseCruiseModeProps {
  map: mapboxgl.Map | null
  sites: HeritageSite[]
  onSiteExamine?: (site: HeritageSite) => void
}

export function useCruiseMode({ map, sites, onSiteExamine }: UseCruiseModeProps) {
  const isPlayingRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [activeSite, setActiveSite] = useState<HeritageSite | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Sort sites North to South (Latitude Descending)
  const sortedSites = useMemo(() => {
    return [...sites].sort((a, b) => b.location.lat - a.location.lat)
  }, [sites])

  const stopOrbit = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const startOrbit = useCallback(() => {
    // Stop any existing
    stopOrbit()

    const animate = () => {
      if (!map || !isPlayingRef.current) return
      map.setBearing(map.getBearing() + 0.05)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [map, stopOrbit])

  const stopCruise = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentIndex(-1)
    setActiveSite(null)
    stopOrbit()

    if (timerRef.current) clearTimeout(timerRef.current)
    window.speechSynthesis.cancel()

    // Reset map pitch/bearing if desired
    if (map) {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      })
    }
  }, [map, stopOrbit])

  const startCruise = useCallback(() => {
    if (!map || sortedSites.length === 0) return
    isPlayingRef.current = true
    setIsPlaying(true)
    setCurrentIndex(-1)
    flyToNextSite(-1)
  }, [map, sortedSites]) // eslint-disable-line react-hooks/exhaustive-deps

  const flyToNextSite = (prevIndex: number) => {
    if (!map || !isPlayingRef.current) return

    const nextIndex = prevIndex + 1
    if (nextIndex >= sortedSites.length) {
      stopCruise()
      return
    }

    setCurrentIndex(nextIndex)
    const site = sortedSites[nextIndex]
    setActiveSite(site)

    if (onSiteExamine) onSiteExamine(site)

    // 1. Prepare Speech (Browser Native - Free)
    const story = (site as any).story
    let speechPromise = Promise.resolve()

    if (story) {
      speechPromise = new Promise((resolve) => {
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(story)
        utterance.lang = 'es-CL'
        utterance.rate = 0.9
        utterance.volume = 1.0

        let hasStarted = false

        const speak = () => {
          if (hasStarted || !isPlayingRef.current) return
          hasStarted = true

          const voices = window.speechSynthesis.getVoices()
          const voice = voices.find(v => v.lang === 'es-CL') ||
            voices.find(v => v.name.includes('Google') && v.lang.includes('es')) ||
            voices.find(v => v.lang.includes('es'))

          if (voice) utterance.voice = voice
          window.speechSynthesis.speak(utterance)

          // Start Orbiting when speech starts (and we are zoomed in)
          startOrbit()
        }

        utterance.onend = () => {
          stopOrbit() // Stop orbiting when speech ends
          resolve(void 0)
        }
        utterance.onerror = () => {
          stopOrbit()
          resolve(void 0)
        }

        // Trigger on Zoom Level
        const onZoom = () => {
          if (!isPlayingRef.current) {
            map.off('zoom', onZoom)
            return
          }
          if (map.getZoom() > 16.5) {
            if (window.speechSynthesis.getVoices().length === 0) {
              window.speechSynthesis.onvoiceschanged = () => {
                speak()
                window.speechSynthesis.onvoiceschanged = null
              }
            } else {
              speak()
            }
            map.off('zoom', onZoom)
          }
        }

        map.on('zoom', onZoom)

        // Backup
        map.once('moveend', () => {
          map.off('zoom', onZoom)
          if (!hasStarted) {
            if (window.speechSynthesis.getVoices().length === 0) {
              window.speechSynthesis.onvoiceschanged = () => {
                speak()
                window.speechSynthesis.onvoiceschanged = null
              }
            } else {
              speak()
            }
          }
        })
      })
    }

    // 2. Fly (Closer zoom 18)
    map.flyTo({
      center: [site.location.lng, site.location.lat],
      zoom: 18,
      pitch: 60,
      bearing: Math.random() * 30 - 15,
      speed: 0.8,
      curve: 1.2,
      essential: true
    })

    const flightPromise = new Promise<void>((resolve) => {
      map.once('moveend', () => resolve())
    })

    // 3. Wait for BOTH
    Promise.all([flightPromise, speechPromise]).then(() => {
      if (!isPlayingRef.current) return

      stopOrbit() // Ensure orbit is stopped
      // Small pause after everything finishes before moving on
      timerRef.current = setTimeout(() => {
        flyToNextSite(nextIndex)
      }, 2000)
    })
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.speechSynthesis.cancel()
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      isPlayingRef.current = false
    }
  }, [])

  return {
    isCruiseActive: isPlaying,
    activeCruiseSite: activeSite,
    startCruise,
    stopCruise
  }
}
