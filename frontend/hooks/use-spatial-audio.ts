import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/mock'
import { useSpatialContext } from '@/contexts/spatial-context'

interface UseSpatialAudioProps {
  map: mapboxgl.Map | null
  sites: HeritageSite[]
  mode: 'interactive' | 'preface' | 'focused' | 'disabled' | 'cruise'
}

export function useSpatialAudio({ map, sites, mode }: UseSpatialAudioProps) {
  // Get isNarrating from context
  const { isNarrating } = useSpatialContext()

  // Proximity in meters to start hearing the story
  const STORY_THRESHOLD = 50
  // Proximity in meters where story is at max volume
  const STORY_MAX_VOL_THRESHOLD = 10

  const audioContextRef = useRef<AudioContext | null>(null)
  const ambientNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const filterNodeRef = useRef<BiquadFilterNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  const currentStoryIdRef = useRef<string | null>(null)

  // Horn sound timer refs
  const carHornTimerRef = useRef<NodeJS.Timeout | null>(null)
  const truckHornTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Audio & Context
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Create Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const audioCtx = new AudioContextClass()
    audioContextRef.current = audioCtx

    // Ambient Audio Element - FIXED PATH
    const ambient = new Audio('/sounds/carretera.wav')
    ambient.loop = true
    ambient.crossOrigin = "anonymous"
    ambientAudioRef.current = ambient

    // Web Audio Pipeline for Ambient
    // Source -> Filter -> Gain -> Destination
    const source = audioCtx.createMediaElementSource(ambient)
    const filter = audioCtx.createBiquadFilter()
    const gain = audioCtx.createGain()

    filter.type = 'lowpass'
    filter.frequency.value = 20000 // Open by default

    source.connect(filter)
    filter.connect(gain)
    gain.connect(audioCtx.destination)

    ambientNodeRef.current = source
    filterNodeRef.current = filter
    gainNodeRef.current = gain

    return () => {
      ambient.pause()
      audioCtx.close()
    }
  }, [])

  // Randomized Horn Sounds
  useEffect(() => {
    if (mode === 'disabled' || mode === 'preface') return

    const playCarHorn = () => {
      // Don't play if narrating or speaking a story
      if (isNarrating || window.speechSynthesis.speaking) return

      const carHorn = new Audio('/sounds/car-horn.mp3')
      carHorn.volume = 0.075
      carHorn.play().catch(() => { })

      // Play second honk after 0.5s
      setTimeout(() => {
        if (isNarrating || window.speechSynthesis.speaking) return
        const carHorn2 = new Audio('/sounds/car-horn.mp3')
        carHorn2.volume = 0.075
        carHorn2.play().catch(() => { })
      }, 500)

      // Schedule next car horn (5-15 seconds)
      const nextDelay = 5000 + Math.random() * 10000
      carHornTimerRef.current = setTimeout(playCarHorn, nextDelay)
    }

    const playTruckHorn = () => {
      if (isNarrating || window.speechSynthesis.speaking) return

      const truckHorn = new Audio('/sounds/truck-horn.mp3')
      truckHorn.volume = 0.02
      truckHorn.play().catch(() => { })

      // Schedule next truck horn (5-15 seconds)
      const nextDelay = 5000 + Math.random() * 10000
      truckHornTimerRef.current = setTimeout(playTruckHorn, nextDelay)
    }

    // Start both horn loops with initial random delays
    const initialCarDelay = 2000 + Math.random() * 8000
    const initialTruckDelay = 3000 + Math.random() * 10000

    carHornTimerRef.current = setTimeout(playCarHorn, initialCarDelay)
    truckHornTimerRef.current = setTimeout(playTruckHorn, initialTruckDelay)

    return () => {
      if (carHornTimerRef.current) clearTimeout(carHornTimerRef.current)
      if (truckHornTimerRef.current) clearTimeout(truckHornTimerRef.current)
    }
  }, [mode, isNarrating])

  // Handle Mode Changes (Effect & Volume Baseline)
  useEffect(() => {
    if (!audioContextRef.current || !filterNodeRef.current || !gainNodeRef.current || !ambientAudioRef.current) return

    const ctx = audioContextRef.current
    const filter = filterNodeRef.current
    const gain = gainNodeRef.current
    const ambient = ambientAudioRef.current

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    if (mode === 'disabled') {
      ambient.pause()
      window.speechSynthesis.cancel()
    } else {
      if (ambient.paused) {
        ambient.play().catch(e => {
          if (e.name !== 'AbortError') {
            console.warn("Audio play blocked", e)
          }
        })
      }
    }

    // Mode Logic
    if (mode === 'preface') {
      // Less muffled filter + 25% volume
      filter.frequency.setTargetAtTime(2000, ctx.currentTime, 0.15) // Less muffled
      gain.gain.setTargetAtTime(0.25, ctx.currentTime, 0.5)
      window.speechSynthesis.cancel()
    } else if (mode === 'focused') {
      // Clear sound + 25% volume
      filter.frequency.setTargetAtTime(20000, ctx.currentTime, 0.5) // Open
      gain.gain.setTargetAtTime(0.25, ctx.currentTime, 0.5)
      window.speechSynthesis.cancel()
    } else if (mode === 'interactive' || mode === 'cruise') {
      // Clear sound + Dynamic Volume (handled in spatial loop)
      filter.frequency.setTargetAtTime(20000, ctx.currentTime, 0.5)
      // Gain will be controlled by spatial loop
    }

  }, [mode])

  // Spatial Logic loop (Active in 'interactive' or 'cruise')
  useEffect(() => {
    if (!map || (mode !== 'interactive' && mode !== 'cruise')) return

    const updateAudio = () => {
      if (!gainNodeRef.current || !audioContextRef.current) return

      const center = map.getCenter()

      // Find Nearest Site
      let minDistance = Infinity
      let nearestSite: HeritageSite | null = null

      sites.forEach(site => {
        const siteLoc = new mapboxgl.LngLat(site.location.lng, site.location.lat)
        const dist = siteLoc.distanceTo(center)
        if (dist < minDistance) {
          minDistance = dist
          nearestSite = site
        }
      })

      // 3. Ambient Gain Logic - Constant volume, duck only when narrating
      let ambientGain = 0.5 // Constant base volume

      if (isNarrating || (typeof window !== 'undefined' && window.speechSynthesis.speaking)) {
        // Cruise Mode: Duck to 25% when narrating OR speaking
        ambientGain = 0.25
      } else if (mode === 'interactive' && minDistance < STORY_THRESHOLD) {
        // Interactive Mode: Proximity ducking
        const proximity = 1 - (Math.max(0, minDistance - STORY_MAX_VOL_THRESHOLD) / (STORY_THRESHOLD - STORY_MAX_VOL_THRESHOLD))
        // Fade from 0.5 down to 0.25
        ambientGain = 0.5 - (0.25 * proximity)
      }

      // 4. Update Ambient Gain
      const targetGain = Math.max(0, Math.min(1, ambientGain))
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.1)

      // 5. Web Speech API Logic (Only in Interactive Mode)
      if (mode === 'interactive') {
        if (minDistance < STORY_THRESHOLD && nearestSite) {
          const site = nearestSite as HeritageSite
          // Check if new story or different story
          if (site.id !== currentStoryIdRef.current && site.story) {
            // Play new story
            currentStoryIdRef.current = site.id
            window.speechSynthesis.cancel() // Strict cancel before new speech

            const speak = () => {
              // Double check not speaking
              window.speechSynthesis.cancel()
              const utterance = new SpeechSynthesisUtterance((site as any).story)
              utterance.lang = 'es-CL'
              utterance.rate = 0.9
              utterance.volume = 1.0

              const voices = window.speechSynthesis.getVoices()
              const voice = voices.find(v => v.lang === 'es-CL') ||
                voices.find(v => v.lang.includes('es'))
              if (voice) utterance.voice = voice

              window.speechSynthesis.speak(utterance)
            }

            if (window.speechSynthesis.getVoices().length === 0) {
              window.speechSynthesis.onvoiceschanged = () => {
                speak()
                window.speechSynthesis.onvoiceschanged = null
              }
            } else {
              speak()
            }
          }
        } else {
          // Too far from any site
          if (currentStoryIdRef.current) {
            window.speechSynthesis.cancel()
            currentStoryIdRef.current = null
          }
        }
      }
    }

    map.on('move', updateAudio)

    // Initial call
    updateAudio()

    return () => {
      map.off('move', updateAudio)
      if (mode !== 'cruise') {
        // Only cancel speech if leaving interactive mode completely (or handling differently)
        // Actually, if unmounting or changing modes, cancellation is good.
        // But 'cruise' mode manages its own speech, so 'useCruiseMode' handles cancellation.
        // 'interactive' uses WebSpeech.
        // If switching from interactive -> cruise, the 'mode' changes.
        window.speechSynthesis.cancel()
      }
    }
  }, [map, sites, mode, isNarrating])
}
