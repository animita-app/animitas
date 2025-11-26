'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useRouter } from 'next/navigation'
import type { FeatureCollection, Point } from 'geojson'
import * as GeoJSON from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MemorialPopup } from './memorial-popup'
import { MarkerIcon } from './MarkerIcon'

interface MapboxMapProps {
  accessToken: string
  style?: string
  focusedMemorialId?: string | null
  isModal?: boolean
}

const CHILE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-75.6, -56.0],
  [-66.4, -17.5]
]

const CHILE_SAFE_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-180.0, -85.0],
  [-30.0, 40.0]
]

const EMPTY_MEMORIALS: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: []
}

const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 15,
  clusterRadius: 25
}

const PROFILE_ZOOM_THRESHOLD = 8
const TARGET_ZOOM = 15.5
const CLUSTER_MAX_EXPANSION_ZOOM = 18
const CLUSTER_FIT_BOUNDS_MAX_ZOOM = 16
const SMALL_CLUSTER_THRESHOLD = 8

export default function MapboxMap({ accessToken, style, focusedMemorialId, isModal = true }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [memorials, setMemorials] = useState<FeatureCollection<Point>>(EMPTY_MEMORIALS)
  const [showProfileMarkers, setShowProfileMarkers] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const profileMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const profileViewState = useRef(false)
  const lastFocusedIdRef = useRef<string | null>(null)
  const memorialDataRef = useRef<Map<string, any>>(new Map())
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const router = useRouter()

  const focusMemorial = useCallback(
    (
      memorialId: string,
      coordinates: [number, number],
      options?: {
        shouldNavigate?: boolean
        instant?: boolean
      }
    ) => {
      const { shouldNavigate = true, instant = false } = options ?? {}
      const mapInstance = map.current
      if (!mapInstance) return

      const drawerHeight = 720 / 1.75;

      const padding = {
        top: 0,
        bottom: drawerHeight,
        left: 0,
        right: 0
      }

      mapInstance.resize()

      if (instant) {
        mapInstance.jumpTo({
          center: coordinates,
          zoom: TARGET_ZOOM,
          bearing: mapInstance.getBearing(),
          pitch: mapInstance.getPitch(),
          padding
        })
      } else {
        const currentZoom = mapInstance.getZoom()
        const canViewProfile = currentZoom >= PROFILE_ZOOM_THRESHOLD

        if (!canViewProfile) {
          mapInstance.flyTo({
            center: coordinates,
            zoom: TARGET_ZOOM,
            speed: 3, // Increased speed
            curve: 1, // Reduced curve for faster feel
            bearing: mapInstance.getBearing(),
            pitch: mapInstance.getPitch(),
            padding,
            essential: true
          })
        } else {
          mapInstance.easeTo({
            center: coordinates,
            zoom: Math.max(currentZoom, TARGET_ZOOM - 1),
            duration: 600, // Shortened duration
            bearing: mapInstance.getBearing(),
            pitch: mapInstance.getPitch(),
            padding,
            essential: true
          })
        }
      }

      if (shouldNavigate) {
        router.push(`/animita/${memorialId}`)
      }
    },
    [router]
  )

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style ?? 'mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7',
      center: [-71.0, -36.0],
      zoom: 3,
      attributionControl: false,
      maxBounds: CHILE_SAFE_BOUNDS
    })

    map.current.on('load', () => {
      const mapInstance = map.current!
      setIsMapReady(true)
      mapInstance.fitBounds(CHILE_BOUNDS, { padding: 64, duration: 0 })

      const currentZoom = mapInstance.getZoom()
      mapInstance.setMinZoom(currentZoom)
      mapInstance.setMaxZoom(22)

      if (!mapInstance.getSource('memorials')) {
        mapInstance.addSource('memorials', {
          type: 'geojson',
          data: EMPTY_MEMORIALS,
          ...CLUSTER_CONFIG
        })
      }

      if (!mapInstance.getLayer('clusters')) {
        mapInstance.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'memorials',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              'transparent',
              10,
              'transparent',
              30,
              'transparent'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              30,
              40
            ],
            'circle-opacity': 0.85,
            'circle-stroke-color': '#111111',
            'circle-stroke-width': 1.5
          }
        })
      }

      if (!mapInstance.getLayer('cluster-count')) {
        mapInstance.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'memorials',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
          },
          paint: {
            'text-color': '#111111'
          }
        })
      }

      if (!mapInstance.getLayer('memorials-outer')) {
        mapInstance.addLayer({
          id: 'memorials-outer',
          type: 'circle',
          source: 'memorials',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3,
              8,
              6,
              18
            ],
            'circle-color': 'transparent',
            'circle-opacity': 0.85,
            'circle-stroke-color': '#111111',
            'circle-stroke-width': 1.5
          }
        })
      }

      if (!mapInstance.getLayer('memorials-inner')) {
        mapInstance.addLayer({
          id: 'memorials-inner',
          type: 'circle',
          source: 'memorials',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3,
              2.5,
              6,
              6
            ],
            'circle-color': '#111111',
            'circle-opacity': 0.92
          }
        })
      }

      const handleMemorialClick = (event: mapboxgl.MapMouseEvent) => {
        const features = mapInstance.queryRenderedFeatures(event.point, {
          layers: ['memorials-outer', 'memorials-inner']
        })
        const feature = features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return

        const id = feature.properties?.id
        const name = feature.properties?.name
        if (typeof id !== 'string' || typeof name !== 'string') return

        const memorial = memorialDataRef.current.get(id)
        const images = memorial?.images || []
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number]

        // Tooltip popup removed to simplify UI
        setTimeout(() => {
          focusMemorial(id, coordinates)
        }, 300)
      }

      const handleClusterClick = (event: mapboxgl.MapMouseEvent) => {
        const features = mapInstance.queryRenderedFeatures(event.point, {
          layers: ['clusters']
        })
        const clusterId = features[0]?.properties?.cluster_id
        const pointCount = features[0]?.properties?.point_count ?? 0
        if (clusterId === undefined) return

        const source = mapInstance.getSource('memorials') as mapboxgl.GeoJSONSource
        const clusterFeature = features[0]
        if (!clusterFeature || clusterFeature.geometry.type !== 'Point') return

        const clusterCoordinates = (clusterFeature.geometry as GeoJSON.Point).coordinates as [number, number]

        if (pointCount <= SMALL_CLUSTER_THRESHOLD) {
          source.getClusterLeaves(clusterId, pointCount, 0, (err, leaves) => {
            if (err || !leaves || leaves.length === 0) {
              source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return
                const targetZoom = Math.min(
                  Math.max(zoom ?? mapInstance.getZoom() + 1, TARGET_ZOOM - 1),
                  CLUSTER_MAX_EXPANSION_ZOOM
                )
                mapInstance.flyTo({
                  center: clusterCoordinates,
                  zoom: targetZoom,
                  speed: 1.2,
                  curve: 1.4,
                  essential: true
                })
              })
              return
            }

            const bounds = new mapboxgl.LngLatBounds()
            leaves.forEach((leaf) => {
              if (leaf.geometry.type === 'Point') {
                bounds.extend((leaf.geometry as GeoJSON.Point).coordinates as [number, number])
              }
            })

            const zoom = mapInstance.getZoom()
            const targetZoom = Math.min(zoom + 2, CLUSTER_FIT_BOUNDS_MAX_ZOOM)
            const center = bounds.getCenter()

            mapInstance.flyTo({
              center,
              zoom: targetZoom,
              speed: 1.2,
              curve: 1.4,
              duration: 1000,
              essential: true
            })
          })
        } else {
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return
            const targetZoom = Math.min(
              Math.max(zoom ?? mapInstance.getZoom() + 1, TARGET_ZOOM - 1),
              CLUSTER_MAX_EXPANSION_ZOOM
            )
            mapInstance.flyTo({
              center: clusterCoordinates,
              zoom: targetZoom,
              speed: 1.2,
              curve: 1.4,
              bearing: mapInstance.getBearing(),
              pitch: mapInstance.getPitch(),
              essential: true
            })
          })
        }
      }

      const handleZoomChange = () => {
        const currentZoom = mapInstance.getZoom()
        const shouldShowProfiles = currentZoom >= PROFILE_ZOOM_THRESHOLD

        if (profileViewState.current !== shouldShowProfiles) {
          profileViewState.current = shouldShowProfiles
          setShowProfileMarkers(shouldShowProfiles)
        }

        if (shouldShowProfiles) {
          // Calculate scale: 0.4 at zoom 8, 1.0 at zoom 15.5
          const scale = Math.max(0.4, Math.min(1.2, 0.4 + (currentZoom - 8) * 0.08))

          // Sticker scales relative to the marker scale
          const stickerRadiusScale = Math.max(1.0, 1.0 + (15.5 - currentZoom) * 0.05)
          const stickerSizeScale = Math.max(1.0, 1.0 + (15.5 - currentZoom) * 0.1)

          profileMarkers.current.forEach((marker) => {
            const element = marker.getElement()
            const child = element.firstElementChild as HTMLElement
            if (child) {
              child.style.transform = `scale(${scale})`
              child.style.transition = 'none'
              child.style.transformOrigin = 'bottom center'
              child.style.setProperty('--sticker-radius-scale', stickerRadiusScale.toString())
              child.style.setProperty('--sticker-size-scale', stickerSizeScale.toString())
            }
          })
        }
      }

      mapInstance.on('zoom', handleZoomChange)
      mapInstance.on('zoomend', handleZoomChange) // Ensure final state is correct
      handleZoomChange()

      mapInstance.on('click', 'clusters', handleClusterClick)
      mapInstance.on('click', 'memorials-outer', handleMemorialClick)
      mapInstance.on('click', 'memorials-inner', handleMemorialClick)

      // Handle background clicks to close drawer
      mapInstance.on('click', (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['clusters', 'memorials-outer', 'memorials-inner']
        })

        if (features.length > 0) return

        if (window.location.pathname.includes('/animita/')) {
          router.push('/')
        }
      })

      mapInstance.once('remove', () => {
        mapInstance.off('click', 'clusters', handleClusterClick)
        mapInstance.off('click', 'memorials-outer', handleMemorialClick)
        mapInstance.off('click', 'memorials-inner', handleMemorialClick)
        mapInstance.off('zoom', handleZoomChange)
        profileMarkers.current.forEach((marker) => marker.remove())
        profileMarkers.current.clear()
        profileViewState.current = false
        setShowProfileMarkers(false)
        lastFocusedIdRef.current = null
        setIsMapReady(false)
      })
    })

    return () => {
      map.current?.remove()
      map.current = null
      lastFocusedIdRef.current = null
      setIsMapReady(false)
    }
  }, [accessToken, style, focusMemorial])

  useEffect(() => {
    let cancelled = false

    const fetchMemorials = async () => {
      try {
        const { getAllAnimitas } = await import('@/lib/mockService')
        const animitas = await getAllAnimitas()

        if (cancelled) return

        const features = animitas.map((animita) => {
          memorialDataRef.current.set(animita.id, animita)
          return {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [animita.lng, animita.lat] as [number, number]
            },
            properties: {
              id: animita.id,
              name: animita.name,
              image: animita.images[0] || null,
              story: animita.story,
              stickers: animita.stickers
            }
          }
        })

        const geojson: FeatureCollection<Point> = {
          type: 'FeatureCollection',
          features
        }

        setMemorials(geojson)
      } catch (error) {
      }
    }

    fetchMemorials()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isMapReady) return
    if (!map.current) return

    const source = map.current.getSource('memorials') as mapboxgl.GeoJSONSource | undefined
    if (!source) return

    source.setData(memorials)
  }, [memorials, isMapReady])

  useEffect(() => {
    const mapInstance = map.current
    if (!mapInstance) return

    const toggleLayer = (layerId: string, visible: boolean) => {
      if (!mapInstance.getLayer(layerId)) return
      mapInstance.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
    }

    if (!showProfileMarkers) {
      toggleLayer('clusters', true)
      toggleLayer('cluster-count', true)
      toggleLayer('memorials-outer', true)
      toggleLayer('memorials-inner', true)
      profileMarkers.current.forEach((marker) => marker.remove())
      profileMarkers.current.clear()
      return
    }

    toggleLayer('clusters', false)
    toggleLayer('cluster-count', false)
    toggleLayer('memorials-outer', false)
    toggleLayer('memorials-inner', false)

    const activeIds = new Set<string>()

    for (const feature of memorials.features) {
      if (feature.geometry.type !== 'Point') continue

      const properties = (feature.properties ?? {}) as Record<string, unknown>
      const memorialId = properties.id
      if (typeof memorialId !== 'string') continue

      const coordinates = feature.geometry.coordinates as [number, number]
      const displayName = typeof properties.name === 'string' ? properties.name : 'Memorial'

      activeIds.add(memorialId)

      const existing = profileMarkers.current.get(memorialId)
      if (existing) {
        existing.setLngLat(coordinates)
        continue
      }

      const markerElement = document.createElement('div')
      markerElement.className = 'cursor-pointer'
      markerElement.dataset.memorialId = memorialId

      const memorial = memorialDataRef.current.get(memorialId)
      const markerRoot = createRoot(markerElement)
      markerRoot.render(
        <div onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          e.nativeEvent.stopImmediatePropagation()
          focusMemorial(memorialId, coordinates)
        }}>
          <MarkerIcon
            id={memorialId}
            name={displayName}
            images={memorial?.images}
            stickers={memorial?.stickers || (properties.stickers as any[])}
          />
        </div>
      )

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat(coordinates)
        .addTo(mapInstance)

      profileMarkers.current.set(memorialId, marker)

      // Apply initial scale
      const currentZoom = mapInstance.getZoom()
      const scale = Math.max(0.4, Math.min(1.2, 0.4 + (currentZoom - 8) * 0.08))
      const stickerRadiusScale = Math.max(1.0, 1.0 + (15.5 - currentZoom) * 0.05)
      const stickerSizeScale = Math.max(1.0, 1.0 + (15.5 - currentZoom) * 0.1)

      const element = marker.getElement()
      const child = element.firstElementChild as HTMLElement
      if (child) {
        child.style.transform = `scale(${scale})`
        child.style.transition = 'none'
        child.style.transformOrigin = 'bottom center'
        child.style.setProperty('--sticker-radius-scale', stickerRadiusScale.toString())
        child.style.setProperty('--sticker-size-scale', stickerSizeScale.toString())
      }
    }

    profileMarkers.current.forEach((marker, id) => {
      if (activeIds.has(id)) return
      marker.remove()
      profileMarkers.current.delete(id)
    })
  }, [memorials, showProfileMarkers, focusMemorial])

  useEffect(() => {
    if (!focusedMemorialId) {
      return
    }

    if (!isMapReady || !map.current) return

    if (lastFocusedIdRef.current === focusedMemorialId) return

    const feature = memorials.features.find((candidate) => {
      if (!candidate || candidate.geometry.type !== 'Point') return false
      const properties = (candidate.properties ?? {}) as Record<string, unknown>
      return typeof properties.id === 'string' && properties.id === focusedMemorialId
    })

    if (!feature || feature.geometry.type !== 'Point') return

    // Determine if this is the initial load or a subsequent navigation
    // If lastFocusedIdRef.current is null, it might be the first focus action.
    // However, we want to be careful. If the map just loaded and we have a focusedMemorialId, it's likely a direct load.
    // We can check if we have ever focused before.

    // Actually, the requirement is "only if we were previously on another route".
    // If we load directly, isModal is false (usually, unless intercepting).
    // But wait, if we load directly /animita/[id], isModal is false.
    // If we navigate from /, isModal might be true or false depending on implementation (here it seems isModal prop is passed).

    // The user said: "its zooming when loading http://localhost:3000/animita/animita-de-romualdito directly, dont do that, only if we were previously on another route"

    // If it's a direct load, `lastFocusedIdRef.current` starts as null.
    // So if `lastFocusedIdRef.current` is null, it's the first focus.
    const isFirstFocus = lastFocusedIdRef.current === null;

    lastFocusedIdRef.current = focusedMemorialId

    focusMemorial(
      focusedMemorialId,
      feature.geometry.coordinates as [number, number],
      {
        shouldNavigate: false,
        instant: isFirstFocus // Use instant zoom if it's the first focus (direct load)
      }
    )
  }, [focusedMemorialId, memorials, isMapReady, focusMemorial])


  return <div ref={mapContainer} className="h-full w-full" />
}
