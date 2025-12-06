import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/mock'

interface UseSpatialAudioProps {
  map: mapboxgl.Map | null
  sites: HeritageSite[]
  enabled?: boolean
}

// Proximity in meters to start hearing the story
const STORY_THRESHOLD = 50
// Proximity in meters where story is at max volume
const STORY_MAX_VOL_THRESHOLD = 10

export function useSpatialAudio({ map, sites, enabled = true }: UseSpatialAudioProps) {
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  const storyAudioRef = useRef<HTMLAudioElement | null>(null)
  const currentStoryIdRef = useRef<string | null>(null)

  // Initialize Audio
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Setup Ambient (Highway/Wind)
    const ambient = new Audio('/sounds/carretera.wav') // Placeholder: Highway ambience
    ambient.loop = true
    ambient.volume = 0
    ambientAudioRef.current = ambient

    // Setup Story Audio (Generic placeholder for now)
    const story = new Audio('https://cdn.freesound.org/previews/320/320665_5260872-lq.mp3') // Placeholder: Soft mumbling/reading
    story.loop = true // Or false if it's a specific short story
    story.volume = 0
    storyAudioRef.current = story

    return () => {
      ambient.pause()
      story.pause()
    }
  }, [])

  // Manage Playback State based on enabled prop
  useEffect(() => {
    if (!ambientAudioRef.current) return

    if (enabled) {
      ambientAudioRef.current.play().catch(e => console.warn("Audio play blocked", e))
    } else {
      ambientAudioRef.current.pause()
      storyAudioRef.current?.pause()
    }
  }, [enabled])

  // Spatial Logic loop
  useEffect(() => {
    if (!map || !enabled) return

    const updateAudio = () => {
      const center = map.getCenter()
      const zoom = map.getZoom()

      // Calculate distances
      let minDistance = Infinity
      let nearestSite: HeritageSite | null = null

      // Only check visible sites or all sites? Checking all might be expensive if thousands.
      // For now, let's assume `sites` is the filtered list (visible ones).
      sites.forEach(site => {
        const siteLoc = new mapboxgl.LngLat(site.location.lng, site.location.lat)
        const dist = siteLoc.distanceTo(center) // Meters
        if (dist < minDistance) {
          minDistance = dist
          nearestSite = site
        }
      })

      // Cross-fade Logic
      // 1. Ambient: Louder when far from sites, quieter when close to a site (focus mode)
      // 2. Story: Louder when close to a site

      let ambientVol = 0.5 // Base volume
      let storyVol = 0

      if (minDistance < STORY_THRESHOLD) {
        // We are entering a site's aura
        const proximity = 1 - (Math.max(0, minDistance - STORY_MAX_VOL_THRESHOLD) / (STORY_THRESHOLD - STORY_MAX_VOL_THRESHOLD))
        // proximity goes from 0 (at 50m) to 1 (at 10m)

        storyVol = proximity
        ambientVol = 0.2 * (1 - proximity) // Dip ambient

        // Switch story track if needed?
        if (nearestSite && nearestSite.id !== currentStoryIdRef.current) {
          // Change track logic here if we had real separate files
          currentStoryIdRef.current = nearestSite.id
          if (storyAudioRef.current) {
            storyAudioRef.current.currentTime = 0
            storyAudioRef.current.play().catch(() => { })
          }
        }
      } else {
        // Far away
        if (storyAudioRef.current) {
          storyAudioRef.current.pause()
        }
        currentStoryIdRef.current = null
      }

      if (ambientAudioRef.current) ambientAudioRef.current.volume = Math.min(1, Math.max(0, ambientVol))
      if (storyAudioRef.current) storyAudioRef.current.volume = Math.min(1, Math.max(0, storyVol))
    }

    map.on('move', updateAudio)

    return () => {
      map.off('move', updateAudio)
    }
  }, [map, sites, enabled])
}
