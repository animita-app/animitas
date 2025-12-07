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

  const flyToNextSite = (prevIndex: number) => {
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

    if (story) {
      speechPromise = new Promise((resolve) => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }

        // Use pre-generated static file
        const audioUrl = `/audio/stories/${site.id}.mp3`
        console.log('[CruiseMode] Loading audio for:', site.id, audioUrl)
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        audio.loop = false
        audio.volume = 1 // Full volume, no fade

        audio.onloadeddata = () => {
          console.log('[CruiseMode] Audio loaded, duration:', audio.duration, 'seconds')
        }

        audio.onended = () => {
          console.log('[CruiseMode] Audio ended for:', site.id)
          stopOrbit()
          setIsNarrating(false)
          resolve(void 0)
        }

        audio.onerror = (e) => {
          console.warn(`[CruiseMode] Audio error for ${site.id}:`, e)
          console.log('[CruiseMode] Continuing to next site despite audio error')
          stopOrbit()
          setIsNarrating(false)
          // Resolve immediately so cruise can continue
          resolve(void 0)
        }

        audio.oncanplaythrough = () => {
          console.log('[CruiseMode] Audio ready to play for:', site.id)
        }

        const play = () => {
          if (!isPlayingRef.current) {
            console.log('[CruiseMode] Not playing, skipping audio play')
            return
          }
          console.log('[CruiseMode] Attempting to play audio for:', site.id)
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('[CruiseMode] Audio playback started for:', site.id)
                startOrbit()
                setIsNarrating(true)
              })
              .catch(e => {
                console.warn('Playback failed', e)
                setIsNarrating(false)
                resolve(void 0)
              })
          }
        }

        // Trigger on Zoom Level
        // Start earlier (e.g. 14.5) to ensure speech starts before full zoom
        const onZoom = () => {
          if (!isPlayingRef.current) {
            map.off('zoom', onZoom)
            return
          }
          if (map.getZoom() > 14.5) {
            map.off('zoom', onZoom)
            play()
          }
        }

        map.on('zoom', onZoom)

        // Backup mechanism
        map.once('moveend', () => {
          map.off('zoom', onZoom)
          // If audio hasn't started, try playing now
          if (audio.paused && audioRef.current === audio) {
            play()
          }
        })
      })
    }

    // 2. Fly (Closer zoom 18)
    console.log('[CruiseMode] Flying to site:', site.id, 'at coordinates:', [site.location.lng, site.location.lat])
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
      let isResolved = false
      const onMoveEnd = () => {
        if (isResolved) return
        isResolved = true
        console.log('[CruiseMode] Flight moveend fired for:', site.id)
        resolve()
      }
      map.once('moveend', onMoveEnd)

      // Safety timeout in case moveend doesn't fire appropriately
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          console.log('[CruiseMode] Flight timeout reached for:', site.id)
          map.off('moveend', onMoveEnd)
          resolve()
        }
      }, 15000)
    })

    // 3. Wait for BOTH
    Promise.all([flightPromise, speechPromise]).then(() => {
      console.log('[CruiseMode] Flight and speech completed for site:', site.id)
      if (!isPlayingRef.current) {
        console.log('[CruiseMode] Not playing anymore, stopping')
        return
      }

      stopOrbit() // Ensure orbit is stopped
      setIsNarrating(false)
      console.log('[CruiseMode] Scheduling next site in 2 seconds...')
      // Small pause after everything finishes before moving on
      timerRef.current = setTimeout(() => {
        console.log('[CruiseMode] Moving to next site')
        flyToNextSite(nextIndex)
      }, 2000)
    })
  }

  // Manual navigation functions
  const skipToNext = useCallback(() => {
    if (!isPlaying || currentIndex >= sortedSites.length - 1) return

    console.log('[CruiseMode] Manual skip to next')
    // Clear current timers and audio
    if (timerRef.current) clearTimeout(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    stopOrbit()
    setIsNarrating(false)

    flyToNextSite(currentIndex)
  }, [isPlaying, currentIndex, sortedSites.length, stopOrbit, setIsNarrating])

  const skipToPrevious = useCallback(() => {
    if (!isPlaying || currentIndex <= 0) return

    console.log('[CruiseMode] Manual skip to previous')
    // Clear current timers and audio
    if (timerRef.current) clearTimeout(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
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
