'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FeatureCollection, Point } from 'geojson'
import * as GeoJSON from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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
const FALLBACK_PERSON_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" fill="%239CA3AF" text-anchor="middle" dy=".3em"%3E?%3C/text%3E%3C/svg%3E'

export default function MapboxMap({ accessToken, style, focusedMemorialId, isModal = true }: MapboxMapProps) {
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
        instant?: boolean
      }
    ) => {
      const { shouldNavigate = true, instant = false } = options ?? {}
      const mapInstance = map.current
      if (!mapInstance) return

      const drawerHeight = 720/1.75;

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
            speed: 2,
            curve: 1.2,
            bearing: mapInstance.getBearing(),
            pitch: mapInstance.getPitch(),
            padding,
            essential: true
          })
        } else {
          mapInstance.easeTo({
            center: coordinates,
            zoom: Math.max(currentZoom, TARGET_ZOOM - 1),
            duration: 400,
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
        if (typeof id !== 'string') return

        const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
        focusMemorial(id, coordinates)
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
  }, [accessToken, style, focusMemorial])

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
            images: Array<{ id: string; url: string }>
            people: Array<{
              id: string
              name: string
              image: string | null
              birthDate: string | null
              deathDate: string | null
            }>
            candles: number
            story: string | null
            createdAt: string
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
              primaryPersonImage: memorial.primaryPersonImage,
              images: memorial.images,
              people: memorial.people,
              candles: memorial.candles,
              story: memorial.story,
              createdAt: memorial.createdAt
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
      const memorialName = typeof properties.name === 'string' ? properties.name : ''
      const people = Array.isArray(properties.people) ? properties.people : []
      const personName = people[0]?.name || ''
      const personImage = people[0]?.image || null
      const displayName =
        memorialName || (personName ? `ANIMITA DE ${personName.toUpperCase()}` : 'Memorial')
      const imageUrl =
        memorialName
          ? typeof properties.primaryPersonImage === 'string' && properties.primaryPersonImage
            ? properties.primaryPersonImage
            : FALLBACK_PERSON_IMAGE
          : personImage || FALLBACK_PERSON_IMAGE

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
      { shouldNavigate: false, instant: !isModal }
    )
  }, [focusedMemorialId, memorials, isMapReady, focusMemorial, isModal])


  return <div ref={mapContainer} className="h-full w-full" />
}
