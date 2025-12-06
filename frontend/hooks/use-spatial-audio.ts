import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/mock'

interface UseSpatialAudioProps {
  map: mapboxgl.Map | null
  sites: HeritageSite[]
  mode: 'interactive' | 'preface' | 'focused' | 'disabled'
}

// Proximity in meters to start hearing the story
const STORY_THRESHOLD = 50
// Proximity in meters where story is at max volume
const STORY_MAX_VOL_THRESHOLD = 10

export function useSpatialAudio({ map, sites, mode }: UseSpatialAudioProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const ambientNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const filterNodeRef = useRef<BiquadFilterNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)

  const storyAudioRef = useRef<HTMLAudioElement | null>(null)
  const currentStoryIdRef = useRef<string | null>(null)

  // Initialize Audio & Context
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Create Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const audioCtx = new AudioContextClass()
    audioContextRef.current = audioCtx

    // Ambient Audio Element
    const ambient = new Audio('/sounds/carretera.wav')
    ambient.loop = true
    ambient.crossOrigin = "anonymous" // Helpful for some CORS issues with Web Audio
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

    // Story Audio (kept simple for now, separate from context or could be added)
    const story = new Audio('https://cdn.freesound.org/previews/320/320665_5260872-lq.mp3')
    story.loop = true
    story.volume = 0
    storyAudioRef.current = story

    return () => {
      ambient.pause()
      story.pause()
      audioCtx.close()
    }
  }, [])

  // Handle Mode Changes (Effect & Volume Baseline)
  useEffect(() => {
    if (!audioContextRef.current || !filterNodeRef.current || !gainNodeRef.current || !ambientAudioRef.current) return

    const ctx = audioContextRef.current
    const filter = filterNodeRef.current
    const gain = gainNodeRef.current
    const ambient = ambientAudioRef.current

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    if (mode === 'disabled') {
      ambient.pause()
      storyAudioRef.current?.pause()
    } else {
      if (ambient.paused) ambient.play().catch(e => console.warn("Audio play blocked", e))
    }

    // Mode Logic
    if (mode === 'preface') {
      // Low-pass filter + 25% volume
      filter.frequency.setTargetAtTime(400, ctx.currentTime, 0.5) // Muffled
      gain.gain.setTargetAtTime(0.25, ctx.currentTime, 0.5)
      storyAudioRef.current?.pause()
    } else if (mode === 'focused') {
      // Clear sound + 50% volume
      filter.frequency.setTargetAtTime(20000, ctx.currentTime, 0.5) // Open
      gain.gain.setTargetAtTime(0.5, ctx.currentTime, 0.5)
      storyAudioRef.current?.pause()
    } else if (mode === 'interactive') {
      // Clear sound + Dynamic Volume (handled in spatial loop)
      filter.frequency.setTargetAtTime(20000, ctx.currentTime, 0.5)
      // Gain will be controlled by spatial loop
    }

  }, [mode])

  // Spatial Logic loop (Only active in 'interactive' mode)
  useEffect(() => {
    if (!map || mode !== 'interactive') return

    const updateAudio = () => {
      if (!gainNodeRef.current || !audioContextRef.current) return

      const center = map.getCenter()

      // Calculate distances
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

      // Cross-fade Logic (for Interactive Mode)
      let ambientGain = 0.5 // Base volume for interactive
      let storyVol = 0

      if (minDistance < STORY_THRESHOLD) {
        const proximity = 1 - (Math.max(0, minDistance - STORY_MAX_VOL_THRESHOLD) / (STORY_THRESHOLD - STORY_MAX_VOL_THRESHOLD))
        storyVol = proximity
        ambientGain = 0.2 * (1 - proximity)

        if (nearestSite && nearestSite.id !== currentStoryIdRef.current) {
          currentStoryIdRef.current = nearestSite.id
          if (storyAudioRef.current) {
            storyAudioRef.current.currentTime = 0
            storyAudioRef.current.play().catch(() => { })
          }
        }
      } else {
        if (storyAudioRef.current) storyAudioRef.current.pause()
        currentStoryIdRef.current = null
      }

      // Update interactive volumes
      // Use linear ramp for smoother updates during movement
      gainNodeRef.current.gain.setTargetAtTime(Math.max(0, ambientGain), audioContextRef.current.currentTime, 0.1)
      if (storyAudioRef.current) storyAudioRef.current.volume = Math.min(1, Math.max(0, storyVol))
    }

    map.on('move', updateAudio)

    // Initial call
    updateAudio()

    return () => {
      map.off('move', updateAudio)
    }
  }, [map, sites, mode])
}
