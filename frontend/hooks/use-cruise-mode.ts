import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/mock'
import { useSpatialContext } from '@/contexts/spatial-context'

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

  const { setIsNarrating } = useSpatialContext()

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Sort sites North to South (Latitude Descending)
  const sortedSites = useMemo(() => {
    return sites
      .filter(site => {
        // Filter out sites without stories or with abbreviated stories (mostly for free users)
        if (!site.story) return false
        if (typeof site.story === 'string' && site.story.includes('Historia completa omitida')) return false
        return true
      })
      .sort((a, b) => b.location.lat - a.location.lat)
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
      map.setBearing(map.getBearing() - 0.05)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [map, stopOrbit])

  const stopCruise = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setIsNarrating(false)
    setCurrentIndex(-1)
    setActiveSite(null)
    stopOrbit()

    if (timerRef.current) clearTimeout(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis.cancel()

    // Reset map pitch/bearing if desired
    if (map) {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      })
    }
  }, [map, stopOrbit, setIsNarrating])

  const startCruise = useCallback(() => {
    if (!map || sortedSites.length === 0) return
    isPlayingRef.current = true
    setIsPlaying(true)
    setCurrentIndex(-1)

    // Initial delay
    timerRef.current = setTimeout(() => {
      flyToNextSite(-1)
    }, 150)
  }, [map, sortedSites]) // eslint-disable-line react-hooks/exhaustive-deps

  const flyToNextSite = useCallback((prevIndex: number) => {
    // Check ref directly
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

    // 1. Prepare Speech (Static Audio Files)
    const story = (site as any).story
    let speechPromise = Promise.resolve()
    let playAudioFn: (() => void) | null = null

    if (story) {
      speechPromise = new Promise((resolve) => {
        // Ensure any previous audio is completely stopped
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          audioRef.current = null
        }

        // Use pre-generated static file
        const audioUrl = `/audio/stories/${site.id}.mp3`
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        audio.loop = false
        audio.volume = 1 // Full volume, no fade
        audio.playbackRate = 1.1 // Play at 1.1x speed

        audio.onended = () => {
          stopOrbit()
          setIsNarrating(false)
          resolve(void 0)
        }

        audio.onerror = (e) => {
          stopOrbit()
          setIsNarrating(false)
          // Resolve immediately so cruise can continue
          resolve(void 0)
        }

        playAudioFn = () => {
          if (!isPlayingRef.current) {
            return
          }
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                startOrbit()
                setIsNarrating(true)
              })
              .catch(e => {
                setIsNarrating(false)
                resolve(void 0)
              })
          }
        }
      })
    }

    // 2. Fly (Closer zoom 18, increased pitch to 75)
    map.flyTo({
      center: [site.location.lng, site.location.lat],
      zoom: 18,
      pitch: 65, // Increased from 60 for more pronounced tilt
      bearing: Math.random() * 30 - 15,
      speed: 0.8,
      curve: 1.2,
      essential: true
    })

    const flightPromise = new Promise<void>((resolve) => {
      let isResolved = false
      const onMoveEnd = () => {
        if (isResolved) return
        isResolved = true

        // Start audio and orbit after zoom reaches ~78% (zoom 14 out of 18)
        if (playAudioFn) {
          const targetZoom = 14 // Start audio at zoom 14
          const currentZoom = map.getZoom()

          if (currentZoom >= targetZoom) {
            setTimeout(() => {
              playAudioFn?.()
            }, 100)
          } else {
            const onZoom = () => {
              if (map.getZoom() >= targetZoom) {
                map.off('zoom', onZoom)
                playAudioFn?.()
              }
            }
            map.on('zoom', onZoom)

            // Fallback timeout in case zoom event doesn't fire
            setTimeout(() => {
              map.off('zoom', onZoom)
              if (playAudioFn) {
                playAudioFn()
              }
            }, 3000)
          }
        }
        resolve()
      }
      map.once('moveend', onMoveEnd)

      // Safety timeout in case moveend doesn't fire appropriately
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          map.off('moveend', onMoveEnd)

          // Still try to play audio even on timeout
          if (playAudioFn) {
            playAudioFn()
          }

          resolve()
        }
      }, 15000)
    })

    // 3. Wait for BOTH
    Promise.all([flightPromise, speechPromise]).then(() => {
      if (!isPlayingRef.current) {
        return
      }
      stopOrbit() // Ensure orbit is stopped
      setIsNarrating(false)
      // Small pause after everything finishes before moving on
      timerRef.current = setTimeout(() => {
        flyToNextSite(nextIndex)
      }, 2000)
    })
  }, [map, sortedSites, onSiteExamine, stopCruise, stopOrbit, setIsNarrating, startOrbit])

  // Manual navigation functions
  const skipToNext = useCallback(() => {
    if (!isPlaying || currentIndex >= sortedSites.length - 1) return

    // Clear current timers and audio
    if (timerRef.current) clearTimeout(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    stopOrbit()
    setIsNarrating(false)

    flyToNextSite(currentIndex)
  }, [isPlaying, currentIndex, sortedSites.length, stopOrbit, setIsNarrating])

  const skipToPrevious = useCallback(() => {
    if (!isPlaying || currentIndex <= 0) return

    // Clear current timers and audio
    if (timerRef.current) clearTimeout(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    stopOrbit()
    setIsNarrating(false)

    flyToNextSite(currentIndex - 2) // -2 because flyToNextSite adds 1
  }, [isPlaying, currentIndex, stopOrbit, setIsNarrating])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      stopOrbit()
      window.speechSynthesis.cancel()
    }
  }, [stopOrbit])

  return {
    isPlaying,
    currentIndex,
    activeCruiseSite: activeSite,
    startCruise,
    stopCruise,
    skipToNext,
    skipToPrevious
  }
}
