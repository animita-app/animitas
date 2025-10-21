'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FeatureCollection, Point } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  accessToken: string
  style?: string
  focusedMemorialId?: string | null
  centerOffset?: [number, number]
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

export default function MapboxMap({ accessToken, style, focusedMemorialId, centerOffset }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [memorials, setMemorials] = useState<FeatureCollection<Point>>(EMPTY_MEMORIALS)
  const [showProfileMarkers, setShowProfileMarkers] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const profileMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const profileViewState = useRef(false)
  const lastFocusedIdRef = useRef<string | null>(null)
  const router = useRouter()

  const focusMemorial = useCallback(
    (
      memorialId: string,
      coordinates: [number, number],
      options?: {
        shouldNavigate?: boolean
      }
    ) => {
      const { shouldNavigate = true } = options ?? {}
      const mapInstance = map.current
      if (!mapInstance) return

      const currentZoom = mapInstance.getZoom()
      const canViewProfile = currentZoom >= PROFILE_ZOOM_THRESHOLD
      const offset = centerOffset && centerOffset[0] !== undefined && centerOffset[1] !== undefined
        ? centerOffset
        : [0, 0]

      if (!canViewProfile) {
        mapInstance.flyTo({
          center: coordinates,
          zoom: TARGET_ZOOM,
          speed: 1.2,
          curve: 1.4,
          bearing: mapInstance.getBearing(),
          pitch: mapInstance.getPitch(),
          offset,
          essential: true
        })
      } else {
        mapInstance.easeTo({
          center: coordinates,
          zoom: Math.max(currentZoom, TARGET_ZOOM - 1),
          speed: 1.2,
          curve: 1.4,
          bearing: mapInstance.getBearing(),
          pitch: mapInstance.getPitch(),
          offset,
          essential: true
        })
      }

      if (shouldNavigate) {
        router.push(`/animita/${memorialId}`)
      }
    },
    [router, centerOffset]
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

      const handleMemorialClick = (event: mapboxgl.MapLayerMouseEvent) => {
        const feature = event.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return

        const id = feature.properties?.id
        if (typeof id !== 'string') return

        const coordinates = feature.geometry.coordinates as [number, number]
        focusMemorial(id, coordinates)
      }

      const handleClusterClick = (event: mapboxgl.MapLayerMouseEvent) => {
        const features = mapInstance.queryRenderedFeatures(event.point, {
          layers: ['clusters']
        })
        const clusterId = features[0]?.properties?.cluster_id
        if (clusterId === undefined) return

        const source = mapInstance.getSource('memorials') as mapboxgl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return

          const clusterFeature = features[0]
          if (!clusterFeature || clusterFeature.geometry.type !== 'Point') return

          const targetZoom = Math.max(zoom ?? mapInstance.getZoom() + 1, TARGET_ZOOM - 1)
          mapInstance.flyTo({
            center: clusterFeature.geometry.coordinates as [number, number],
            zoom: targetZoom,
            speed: 1.2,
            curve: 1.4,
            bearing: mapInstance.getBearing(),
            pitch: mapInstance.getPitch(),
            essential: true
          })
        })
      }

      const handleZoomChange = () => {
        const shouldShowProfiles = mapInstance.getZoom() >= PROFILE_ZOOM_THRESHOLD
        if (profileViewState.current !== shouldShowProfiles) {
          profileViewState.current = shouldShowProfiles
          setShowProfileMarkers(shouldShowProfiles)
        }
      }

      mapInstance.on('zoom', handleZoomChange)
      handleZoomChange()

      mapInstance.on('click', 'clusters', handleClusterClick)
      mapInstance.on('click', 'memorials-outer', handleMemorialClick)
      mapInstance.on('click', 'memorials-inner', handleMemorialClick)

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
  }, [accessToken, style, focusMemorial, centerOffset])

  useEffect(() => {
    let cancelled = false

    const fetchMemorials = async () => {
      try {
        const response = await fetch('/api/memorials')
        if (!response.ok) throw new Error(`Error ${response.status}`)

        const payload: {
          memorials: Array<{
            id: string
            name: string
            coordinates: [number, number]
            primaryPersonImage: string | null
          }>
        } = await response.json()

        if (cancelled) return

        const geojson: FeatureCollection<Point> = {
          type: 'FeatureCollection',
          features: payload.memorials.map((memorial) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: memorial.coordinates
            },
            properties: {
              id: memorial.id,
              name: memorial.name,
              primaryPersonImage: memorial.primaryPersonImage
            }
          }))
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
    if (!map.current) return
    const source = map.current.getSource('memorials') as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(memorials)
    }
  }, [memorials])

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
      const displayName =
        typeof properties.name === 'string' && properties.name
          ? properties.name
          : 'Memorial'
      const imageUrl =
        typeof properties.primaryPersonImage === 'string' && properties.primaryPersonImage
          ? properties.primaryPersonImage
          : FALLBACK_PERSON_IMAGE

      activeIds.add(memorialId)

      const existing = profileMarkers.current.get(memorialId)
      if (existing) {
        existing.setLngLat(coordinates)
        const element = existing.getElement()
        const labelEl = element.querySelector<HTMLElement>('[data-role="memorial-label"]')
        if (labelEl) labelEl.textContent = displayName
        const imageEl = element.querySelector<HTMLImageElement>('img[data-role="memorial-photo"]')
        if (imageEl && imageEl.src !== imageUrl) {
          imageEl.src = imageUrl
        }
        continue
      }

      const markerElement = document.createElement('div')
      markerElement.className =
        'memorial-profile-marker flex cursor-pointer select-none flex-col items-center gap-2'
      markerElement.dataset.memorialId = memorialId

      const textWrapper = document.createElement('div')
      textWrapper.className = 'flex flex-col items-center gap-1'

      const labelEl = document.createElement('div')
      labelEl.dataset.role = 'memorial-label'
      labelEl.textContent = displayName
      labelEl.className =
        'mb-2 text-xs font-semibold uppercase tracking-wide'

      const avatarWrapper = document.createElement('div')
      avatarWrapper.className =
        'h-16 w-16 overflow-hidden rounded-full ring-offset-6 ring-2 ring-black'

      const imageEl = document.createElement('img')
      imageEl.dataset.role = 'memorial-photo'
      imageEl.src = imageUrl
      imageEl.alt = displayName
      imageEl.className = 'h-full w-full object-cover'
      avatarWrapper.appendChild(imageEl)

      textWrapper.appendChild(labelEl)

      markerElement.appendChild(textWrapper)
      markerElement.appendChild(avatarWrapper)

      markerElement.addEventListener('click', (event) => {
        event.stopPropagation()
        focusMemorial(memorialId, coordinates)
      })

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat(coordinates)
        .addTo(mapInstance)

      profileMarkers.current.set(memorialId, marker)
    }

    profileMarkers.current.forEach((marker, id) => {
      if (activeIds.has(id)) return
      marker.remove()
      profileMarkers.current.delete(id)
    })
  }, [memorials, showProfileMarkers, focusMemorial])

  useEffect(() => {
    if (!focusedMemorialId) {
      lastFocusedIdRef.current = null
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

    lastFocusedIdRef.current = focusedMemorialId
    focusMemorial(
      focusedMemorialId,
      feature.geometry.coordinates as [number, number],
      { shouldNavigate: false }
    )
  }, [focusedMemorialId, memorials, isMapReady, focusMemorial])

  return <div ref={mapContainer} className="h-full w-full" />
}
