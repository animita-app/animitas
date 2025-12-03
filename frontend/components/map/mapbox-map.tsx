'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useRouter } from 'next/navigation'
import type { FeatureCollection, Point } from 'geojson'
import * as GeoJSON from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { SearchPanel } from './search-panel'
import { MarkerIcon } from './marker-icon'
import { calculateDistance, calculateBearing } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Locate, ArrowUp } from 'lucide-react'
import { MOCK_SITES, MOCK_PEOPLE } from '@/constants/mockData'
import { SEED_SITES } from '@/constants/sites'
import { fetchContextLayers, OverpassLayerType } from '@/lib/overpass-client'
import { LayersPanel, AnimitaProperty, Layer, GISOperation } from './layers-panel'
import { bufferFeatures, intersectFeatures, dissolveFeatures, clipFeatures, spatialJoin, GISOperationResult } from '@/lib/gis-engine'
import { ActionsPanel } from './actions-panel'
import { COLORS, ICONS, LEGENDS } from '@/lib/map-style'

interface MapboxMapProps {
  accessToken: string
  style?: string
  focusedMemorialId?: string | null
  isModal?: boolean
  onAnalysisRequested?: (data: any) => void
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

const PROFILE_ZOOM_THRESHOLD = 12
const TARGET_ZOOM = 17
const CLUSTER_MAX_EXPANSION_ZOOM = 18
const CLUSTER_FIT_BOUNDS_MAX_ZOOM = 16
const SMALL_CLUSTER_THRESHOLD = 8

export default function MapboxMap({ accessToken, style, focusedMemorialId, isModal = true, onAnalysisRequested }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [memorials, setMemorials] = useState<FeatureCollection<Point>>(EMPTY_MEMORIALS)
  const [showProfileMarkers, setShowProfileMarkers] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [showResetButton, setShowResetButton] = useState(false)
  const profileMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const profileViewState = useRef(false)
  const lastFocusedIdRef = useRef<string | null>(null)
  const memorialDataRef = useRef<Map<string, any>>(new Map())
  const router = useRouter()
  const [isAtInitialView, setIsAtInitialView] = useState(true)

  // Overpass Layers State
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    churches: false,
    cemeteries: false,
    bars: false,
    highways: false,
    convenience: false,
    animitas: true,
    grutas: true
  })

  // GIS & Elements State
  const [elements, setElements] = useState<Layer[]>([])
  const [gisResults, setGisResults] = useState<Record<string, FeatureCollection>>({})

  // Directional indicator state
  const [nearestAnimita, setNearestAnimita] = useState<{
    name: string
    distance: number
    bearing: number
  } | null>(null)

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

      if (shouldNavigate) {
        lastFocusedIdRef.current = memorialId
      }

      const drawerHeight = 720 / 1.75
      const padding = { top: 0, bottom: drawerHeight, left: 0, right: 0 }

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
            speed: 4,
            curve: 1,
            padding,
            essential: true
          })
        } else {
          mapInstance.easeTo({
            center: coordinates,
            zoom: Math.max(currentZoom, TARGET_ZOOM - 1),
            duration: 150,
            bearing: mapInstance.getBearing(),
            pitch: mapInstance.getPitch(),
            padding,
            essential: true
          })
        }
      }

      // if (shouldNavigate) {
      //   router.push(`/animita/${memorialId}`)
      // }
    },
    [router]
  )

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      accessToken,
      style: style || 'mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7',
      center: [-71.0, -36.0],
      zoom: 3,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false
    })

    map.current.on('load', () => {
      const mapInstance = map.current!
      setIsMapReady(true)
      mapInstance.touchZoomRotate.disableRotation()
      mapInstance.fitBounds(CHILE_BOUNDS, { padding: 64, duration: 0 })

      const currentZoom = mapInstance.getZoom()
      const bounds = mapInstance.getBounds()

      mapInstance.setMinZoom(currentZoom)
      if (bounds) {
        const padding = 20 // degrees
        const extendedBounds = new mapboxgl.LngLatBounds(
          [bounds.getWest() - padding, bounds.getSouth() - padding],
          [bounds.getEast() + padding, bounds.getNorth() + padding]
        )
        mapInstance.setMaxBounds(extendedBounds)
      }
      mapInstance.setMaxZoom(22)

      // --- Memorials Source ---
      if (!mapInstance.getSource('memorials')) {
        mapInstance.addSource('memorials', {
          type: 'geojson',
          data: EMPTY_MEMORIALS,
          ...CLUSTER_CONFIG
        })
      }

      // --- Overpass Sources ---
      mapInstance.addSource('iglesias', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      mapInstance.addSource('cementerios', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      mapInstance.addSource('bares', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

      // --- Overpass Layers (Split into Inner/Outer for "Dot" style) ---

      // Iglesias
      mapInstance.addLayer({
        id: 'iglesias-outer',
        type: 'circle',
        source: 'iglesias',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 5,
          'circle-color': 'transparent',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': COLORS.context.churches
        }
      })
      mapInstance.addLayer({
        id: 'iglesias-inner',
        type: 'circle',
        source: 'iglesias',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 2,
          'circle-color': COLORS.context.churches
        }
      })

      // Cementerios
      mapInstance.addLayer({
        id: 'cementerios-outer',
        type: 'circle', // Changed from fill to circle for point representation
        source: 'cementerios',
        filter: ['==', '$type', 'Point'], // Only points
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 5,
          'circle-color': 'transparent',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': COLORS.context.cemeteries
        }
      })
      mapInstance.addLayer({
        id: 'cementerios-inner',
        type: 'circle',
        source: 'cementerios',
        filter: ['==', '$type', 'Point'],
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 2,
          'circle-color': COLORS.context.cemeteries
        }
      })
      // Keep fill layer for polygons if needed, but user asked for "mini animitas" style.
      // Overpass returns nodes (points) and ways (polygons).
      // For consistency, let's keep a fill layer for polygons but maybe style it subtly?
      // Or just rely on the points (centroids) if we were processing them that way.
      // `osmtogeojson` converts ways to Polygons.
      // Let's keep the fill layer for polygons but make it match the theme.
      mapInstance.addLayer({
        id: 'cementerios-poly',
        type: 'fill',
        source: 'cementerios',
        filter: ['==', '$type', 'Polygon'],
        layout: { visibility: 'none' },
        paint: {
          'fill-color': COLORS.context.cemeteries,
          'fill-opacity': 0.2,
          'fill-outline-color': COLORS.context.cemeteries
        }
      })

      // Bares
      mapInstance.addLayer({
        id: 'bares-outer',
        type: 'circle',
        source: 'bares',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 5,
          'circle-color': 'transparent',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': COLORS.context.bars
        }
      })
      mapInstance.addLayer({
        id: 'bares-inner',
        type: 'circle',
        source: 'bares',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 2,
          'circle-color': COLORS.context.bars
        }
      })

      // --- Clusters Layers ---
      if (!mapInstance.getLayer('clusters')) {
        mapInstance.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'memorials',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get', 'point_count'], 'transparent', 10, 'transparent', 30, 'transparent'],
            'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
            'circle-opacity': 0.85,
            'circle-stroke-color': COLORS.animitas,
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
          paint: { 'text-color': COLORS.animitas }
        })
      }

      if (!mapInstance.getLayer('memorials-outer')) {
        mapInstance.addLayer({
          id: 'memorials-outer',
          type: 'circle',
          source: 'memorials',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 8, 6, 18],
            'circle-color': 'transparent',
            'circle-opacity': 0.85,
            'circle-stroke-color': COLORS.animitas,
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
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 2.5, 6, 6],
            'circle-color': COLORS.animitas,
            'circle-opacity': 0.92
          }
        })
      }

      // --- Search Elements Source & Layers ---
      if (!mapInstance.getSource('search-elements')) {
        mapInstance.addSource('search-elements', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      if (!mapInstance.getLayer('search-elements-poly')) {
        mapInstance.addLayer({
          id: 'search-elements-poly',
          type: 'fill',
          source: 'search-elements',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': COLORS.searchElements,
            'fill-opacity': 0.2,
            'fill-outline-color': COLORS.searchElements
          }
        })
      }

      if (!mapInstance.getLayer('search-elements-line')) {
        mapInstance.addLayer({
          id: 'search-elements-line',
          type: 'line',
          source: 'search-elements',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': COLORS.searchElements,
            'line-width': 2
          }
        })
      }

      if (!mapInstance.getLayer('search-elements-point')) {
        mapInstance.addLayer({
          id: 'search-elements-point',
          type: 'circle',
          source: 'search-elements',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': COLORS.searchElements,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        })
      }

      // Handlers
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
        const coordinates: [number, number] = memorial
          ? [memorial.location.lng, memorial.location.lat]
          : (feature.geometry as GeoJSON.Point).coordinates as [number, number]

        focusMemorial(id, coordinates)
      }

      const handleClusterClick = (event: mapboxgl.MapMouseEvent) => {
        const features = mapInstance.queryRenderedFeatures(event.point, { layers: ['clusters'] })
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
                const targetZoom = Math.min(Math.max(zoom ?? mapInstance.getZoom() + 1, TARGET_ZOOM - 1), CLUSTER_MAX_EXPANSION_ZOOM)
                mapInstance.flyTo({ center: clusterCoordinates, zoom: targetZoom, speed: 1.2, curve: 1.4, essential: true })
              })
              return
            }
            const bounds = new mapboxgl.LngLatBounds()
            leaves.forEach((leaf) => {
              if (leaf.geometry.type === 'Point') {
                bounds.extend((leaf.geometry as GeoJSON.Point).coordinates as [number, number])
              }
            })
            mapInstance.flyTo({ center: bounds.getCenter(), zoom: Math.min(mapInstance.getZoom() + 2, CLUSTER_FIT_BOUNDS_MAX_ZOOM), speed: 1.2, curve: 1.4, duration: 500, essential: true })
          })
        } else {
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return
            mapInstance.flyTo({ center: clusterCoordinates, zoom: zoom ?? mapInstance.getZoom() + 1, speed: 1.2, curve: 1.4, essential: true })
          })
        }
      }

      const handleZoomChange = () => {
        const currentZoom = mapInstance.getZoom()
        const shouldShowProfiles = currentZoom >= PROFILE_ZOOM_THRESHOLD

        // Check if at initial view (min zoom)
        const minZoom = mapInstance.getMinZoom()
        setIsAtInitialView(currentZoom <= minZoom + 0.1) // Small tolerance

        if (profileViewState.current !== shouldShowProfiles) {
          profileViewState.current = shouldShowProfiles
          setShowProfileMarkers(shouldShowProfiles)
        }

        if (shouldShowProfiles) {
          // Removed scaling logic as requested by user
          // Markers will stay at their natural size (handled by MarkerIcon)
          profileMarkers.current.forEach((marker) => {
            const element = marker.getElement()
            const child = element.firstElementChild as HTMLElement
            if (child) {
              child.style.transform = 'none'
              child.style.transition = 'none'
            }
          })
        }
      }

      const updateNearestAnimita = () => {
        const currentZoom = mapInstance.getZoom()
        const shouldShowIndicator = currentZoom >= PROFILE_ZOOM_THRESHOLD

        if (!shouldShowIndicator || memorials.features.length <= 1) {
          setNearestAnimita(null)
          return
        }

        const center = mapInstance.getCenter()
        let nearest: { id: string; name: string; distance: number; bearing: number } | null = null

        for (const feature of memorials.features) {
          if (feature.geometry.type !== 'Point') continue
          const properties = (feature.properties ?? {}) as Record<string, unknown>
          const memorialId = properties.id
          if (typeof memorialId !== 'string' || (focusedMemorialId && memorialId === focusedMemorialId)) continue

          const coords = feature.geometry.coordinates as [number, number]
          const distance = calculateDistance(center.lat, center.lng, coords[1], coords[0])
          const bearing = calculateBearing(center.lat, center.lng, coords[1], coords[0])

          if (!nearest || distance < nearest.distance) {
            nearest = {
              id: memorialId,
              name: typeof properties.name === 'string' ? properties.name : 'Animita',
              distance,
              bearing
            }
          }
        }

        setNearestAnimita(nearest)
      }

      mapInstance.on('zoom', handleZoomChange)
      mapInstance.on('zoomend', handleZoomChange)
      mapInstance.on('move', updateNearestAnimita)
      mapInstance.on('moveend', updateNearestAnimita)
      handleZoomChange()
      updateNearestAnimita()

      mapInstance.on('click', 'clusters', handleClusterClick)
      mapInstance.on('click', 'memorials-outer', handleMemorialClick)
      mapInstance.on('click', 'memorials-inner', handleMemorialClick)

      mapInstance.on('click', (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['clusters', 'memorials-outer', 'memorials-inner'] })
        if (features.length > 0) return
        if (window.location.pathname.includes('/animita/')) router.push('/')
      })

      mapInstance.once('remove', () => {
        mapInstance.off('click', 'clusters', handleClusterClick)
        mapInstance.off('click', 'memorials-outer', handleMemorialClick)
        mapInstance.off('click', 'memorials-inner', handleMemorialClick)
        mapInstance.off('zoom', handleZoomChange)
        mapInstance.off('move', updateNearestAnimita)
        mapInstance.off('moveend', updateNearestAnimita)
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

  // GIS Panel State
  const [activeTypologies, setActiveTypologies] = useState<string[]>(['gruta', 'iglesia', 'casa', 'cruz', 'orgánica', 'social', 'moderna', 'monumental'])
  const [activeDeathCauses, setActiveDeathCauses] = useState<string[]>(['accident', 'violence', 'illness', 'natural', 'unknown'])
  const [colorTheme, setColorTheme] = useState<'default' | 'neutral' | 'monochrome'>('default')
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [activeProperties, setActiveProperties] = useState<AnimitaProperty[]>(['typology', 'death_cause'])

  // Search Handlers
  // Search Handlers
  const handleSearchChange = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchSuggestions([])
      return
    }

    // 1. Local Search (SEED_SITES)
    const localResults = SEED_SITES.filter(site =>
      site.title.toLowerCase().includes(query.toLowerCase()) ||
      site.story?.toLowerCase().includes(query.toLowerCase())
    ).map(site => ({
      id: site.id,
      title: site.title,
      center: [site.location.lng, site.location.lat],
      type: 'local'
    }))

    // 2. Mapbox Geocoding
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&country=cl&language=es&bbox=-75.6,-56.0,-66.4,-17.5&types=place,locality,address&limit=5`
      )
      const data = await response.json()
      const mapboxResults = (data.features || []).map((f: any) => ({
        id: f.id,
        title: f.place_name,
        center: f.center,
        bbox: f.bbox,
        type: 'mapbox',
        geometry: f.geometry
      }))

      setSearchSuggestions([...localResults, ...mapboxResults])
    } catch (error) {
      console.error('Search suggestions failed:', error)
      setSearchSuggestions(localResults)
    }
  }

  const handleSelectLocation = (location: any) => {
    if (!map.current || !location) return

    // Use centralized color for search elements
    const elementColor = COLORS.searchElements

    // Add to elements list
    const newElement: Layer = {
      id: location.id,
      label: location.title || location.place_name,
      type: 'analysis',
      geometry: location.geometry?.type === 'Point' ? 'point' : 'polygon', // Simplify
      color: elementColor,
      visible: true,
      opacity: 100,
      source: 'search',
      data: location
    }
    setElements(prev => [...prev, newElement])

    if (location.bbox) {
      map.current.fitBounds(
        [
          [location.bbox[0], location.bbox[1]], // [minLng, minLat]
          [location.bbox[2], location.bbox[3]]  // [maxLng, maxLat]
        ],
        {
          padding: 50,
          maxZoom: 16,
          essential: true
        }
      )
    } else {
      const [lng, lat] = location.center
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14, // Zoom in closer to see layers
        essential: true
      })
    }
    setSearchSuggestions([])
  }

  const handleGISOperation = (operation: GISOperation) => {
    if (!map.current) return

    // For demo purposes, we'll operate on the first element found or the memorials
    // In a real app, we'd select which layers to operate on

    // Example: Buffer around visible memorials
    if (operation === 'buffer') {
      const buffered = bufferFeatures(memorials, 0.5) // 0.5km buffer
      setGisResults(prev => ({ ...prev, buffer: buffered }))

      const source = map.current.getSource('gis-results') as mapboxgl.GeoJSONSource
      if (source) source.setData(buffered)

      // Notify analysis
      onAnalysisRequested?.({ type: 'buffer', data: buffered })
    }

    // Example: Intersect memorials with first search result (if polygon)
    if (operation === 'intersect') {
      const targetElement = elements.find(e => e.geometry === 'polygon')
      if (targetElement && targetElement.data) {
        // Need to convert element data to Feature<Polygon>
        // This is a simplification
      }
    }
  }

  const toggleTypology = (type: string) => {
    setActiveTypologies(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleDeathCause = (cause: string) => {
    setActiveDeathCauses(prev =>
      prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause]
    )
  }

  const handlePropertyToggle = (property: AnimitaProperty, visible: boolean) => {
    setActiveProperties(prev => {
      if (visible) {
        return [...prev, property]
      } else {
        return prev.filter(p => p !== property)
      }
    })
  }

  // Update Layer Visibility
  useEffect(() => {
    if (!isMapReady || !map.current) return
    const mapInstance = map.current

    const toggle = (layer: string, active: boolean) => {
      if (mapInstance.getLayer(layer)) {
        mapInstance.setLayoutProperty(layer, 'visibility', active ? 'visible' : 'none')
      }
    }

    toggle('iglesias-outer', activeLayers.churches)
    toggle('iglesias-inner', activeLayers.churches)

    toggle('cementerios-outer', activeLayers.cemeteries)
    toggle('cementerios-inner', activeLayers.cemeteries)
    toggle('cementerios-poly', activeLayers.cemeteries)

    toggle('bares-outer', activeLayers.bars)
    toggle('bares-inner', activeLayers.bars)

    // Toggle Animitas Layers
    const animitasVisible = activeLayers.animitas
    toggle('clusters', animitasVisible)
    toggle('cluster-count', animitasVisible)
    toggle('memorials-outer', animitasVisible)
    toggle('memorials-inner', animitasVisible)
  }, [activeLayers, isMapReady])

  // Update Layer Theme
  useEffect(() => {
    if (!isMapReady || !map.current) return
    const mapInstance = map.current

    const themes = {
      default: {
        iglesias: COLORS.context.churches,
        cementerios: COLORS.context.cemeteries,
        bares: COLORS.context.bars,
        opacity: 0.6
      },
      neutral: {
        iglesias: '#64748b', // Slate-500
        cementerios: '#475569', // Slate-600
        bares: '#d97706', // Amber-600
        opacity: 0.5
      },
      monochrome: {
        iglesias: '#000000',
        cementerios: '#000000',
        bares: '#000000',
        opacity: 0.8
      }
    }

    const theme = themes[colorTheme]

    const updateTheme = (layerPrefix: string, color: string) => {
      if (mapInstance.getLayer(`${layerPrefix}-outer`)) {
        mapInstance.setPaintProperty(`${layerPrefix}-outer`, 'circle-stroke-color', color)
        // mapInstance.setPaintProperty(`${layerPrefix}-outer`, 'circle-opacity', theme.opacity) // Outer is transparent
      }
      if (mapInstance.getLayer(`${layerPrefix}-inner`)) {
        mapInstance.setPaintProperty(`${layerPrefix}-inner`, 'circle-color', color)
        // mapInstance.setPaintProperty(`${layerPrefix}-inner`, 'circle-opacity', theme.opacity) // Inner is solid
      }
    }

    updateTheme('iglesias', theme.iglesias)
    updateTheme('cementerios', theme.cementerios)
    updateTheme('bares', theme.bares)

    if (mapInstance.getLayer('cementerios-poly')) {
      mapInstance.setPaintProperty('cementerios-poly', 'fill-color', theme.cementerios)
      mapInstance.setPaintProperty('cementerios-poly', 'fill-outline-color', theme.cementerios)
    }

  }, [colorTheme, isMapReady])

  // Filter Memorials by Typology and Death Cause
  useEffect(() => {
    if (!isMapReady || !map.current) return

    const filteredFeatures = SEED_SITES
      .filter(site => {
        // Filter by Typology
        const typeMatch = activeTypologies.includes(site.typology)

        // Filter by Death Cause
        const cause = site.insights?.memorial?.death_cause || 'unknown'
        const causeMatch = activeDeathCauses.includes(cause)

        return typeMatch && causeMatch
      })
      .map((site) => {
        memorialDataRef.current.set(site.id, site)

        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [site.location.lng, site.location.lat] as [number, number]
          },
          properties: {
            id: site.id,
            name: site.title,
            images: site.images,
            typology: site.typology,
            death_cause: site.insights?.memorial?.death_cause || 'unknown'
          }
        }
      })

    const geojson: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: filteredFeatures
    }

    setMemorials(geojson)
  }, [activeTypologies, activeDeathCauses, isMapReady])

  // Update Source Data
  useEffect(() => {
    if (!isMapReady || !map.current) return
    const source = map.current.getSource('memorials') as mapboxgl.GeoJSONSource | undefined
    if (source) source.setData(memorials)
  }, [memorials, isMapReady])

  // Fetch and Update Context Layers
  useEffect(() => {
    if (!isMapReady || !map.current) return

    const loadContextData = async () => {
      try {
        const data = await fetchContextLayers()

        const updateSource = (id: string, geojson: any) => {
          const source = map.current?.getSource(id) as mapboxgl.GeoJSONSource | undefined
          if (source) source.setData(geojson)
        }

        updateSource('iglesias', data.churches)
        updateSource('cementerios', data.cemeteries)
        updateSource('bares', data.bars)
      } catch (error) {
        console.error('Failed to load context layers:', error)
      }
    }

    loadContextData()
  }, [isMapReady])

  // Update Search Elements Source
  useEffect(() => {
    if (!isMapReady || !map.current) return

    const features = elements
      .filter(e => e.source === 'search' && e.visible)
      .map(e => {
        if (e.data?.geometry) {
          return {
            type: 'Feature',
            geometry: e.data.geometry,
            properties: { id: e.id, title: e.label }
          }
        } else if (e.data?.center) {
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: e.data.center },
            properties: { id: e.id, title: e.label }
          }
        }
        return null
      })
      .filter(Boolean) as any[]

    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features
    }

    const source = map.current.getSource('search-elements') as mapboxgl.GeoJSONSource | undefined
    if (source) source.setData(geojson)
  }, [elements, isMapReady])

  // Profile Markers (Custom Elements)
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
      const typology = typeof properties.typology === 'string' ? properties.typology : undefined
      const death_cause = typeof properties.death_cause === 'string' ? properties.death_cause : undefined

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

      // Use MarkerIcon with mock data
      markerRoot.render(
        <div onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          focusMemorial(memorialId, coordinates, { shouldNavigate: false })
        }}>
          <MarkerIcon
            site={memorial}
            activeProperties={activeProperties}
            zoomedIn={showProfileMarkers}
          />
        </div>
      )

      const marker = new mapboxgl.Marker({ element: markerElement, anchor: 'bottom' })
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



  // Toggle Overpass Layers


  // ... existing state ...
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmapMetric, setHeatmapMetric] = useState<'income' | 'poverty'>('income')

  // ... existing handlers ...

  // Fetch Heatmap Data
  useEffect(() => {
    if (!isMapReady || !map.current) return

    const loadHeatmapData = async () => {
      try {
        // 1. Fetch Stats
        const statsRes = await fetch('/data/comuna-stats.json')
        const stats = await statsRes.json()

        // 2. Fetch GeoJSON
        const geoRes = await fetch('https://raw.githubusercontent.com/fcortes/Chile-GeoJSON/master/comunas.geojson')
        const geoJson = await geoRes.json()

        // 3. Merge Data
        const mergedFeatures = geoJson.features.map((feature: any) => {
          const code = feature.properties.cod_comuna
          const stat = stats[code]
          return {
            ...feature,
            properties: {
              ...feature.properties,
              income: stat ? stat.avg_income : 0,
              poverty: stat ? stat.poverty_rate : 0,
              hasData: !!stat
            }
          }
        })

        const mergedGeoJson = { ...geoJson, features: mergedFeatures }

        // 4. Add Source
        if (!map.current?.getSource('comunas-data')) {
          map.current?.addSource('comunas-data', {
            type: 'geojson',
            data: mergedGeoJson
          })
        }

        // 5. Add Layers
        // Income Layer (Red -> Yellow -> Blue)
        if (!map.current?.getLayer('heatmap-income')) {
          map.current?.addLayer({
            id: 'heatmap-income',
            type: 'fill',
            source: 'comunas-data',
            layout: { visibility: 'none' },
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'income'],
                0, '#d73027',      // Red (Low)
                500000, '#fc8d59',
                800000, '#fee090',
                1200000, '#ffffbf', // Yellow (Mid)
                2000000, '#e0f3f8',
                3000000, '#91bfdb',
                4000000, '#4575b4'  // Blue (High)
              ],
              'fill-opacity': 0.6
            }
          })
        }

        // Poverty Layer (Blue -> Yellow -> Red)
        if (!map.current?.getLayer('heatmap-poverty')) {
          map.current?.addLayer({
            id: 'heatmap-poverty',
            type: 'fill',
            source: 'comunas-data',
            layout: { visibility: 'none' },
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'poverty'],
                0, '#4575b4',      // Blue (Low Poverty)
                0.05, '#91bfdb',
                0.1, '#e0f3f8',
                0.15, '#ffffbf',   // Yellow (Mid)
                0.2, '#fee090',
                0.3, '#fc8d59',
                0.4, '#d73027'     // Red (High Poverty)
              ],
              'fill-opacity': 0.6
            }
          })
        }

        console.log('Heatmap layers added successfully')

      } catch (error) {
        console.error('Error loading heatmap data:', error)
      }
    }

    loadHeatmapData()
  }, [isMapReady])

  // Toggle Heatmap Visibility
  useEffect(() => {
    if (!isMapReady || !map.current) return

    const incomeVisibility = showHeatmap && heatmapMetric === 'income' ? 'visible' : 'none'
    const povertyVisibility = showHeatmap && heatmapMetric === 'poverty' ? 'visible' : 'none'

    console.log('Toggling Heatmap:', { showHeatmap, heatmapMetric, incomeVisibility, povertyVisibility })

    if (map.current.getLayer('heatmap-income')) {
      map.current.setLayoutProperty('heatmap-income', 'visibility', incomeVisibility)
    }
    if (map.current.getLayer('heatmap-poverty')) {
      map.current.setLayoutProperty('heatmap-poverty', 'visibility', povertyVisibility)
    }
  }, [showHeatmap, heatmapMetric, isMapReady])

  const toggleLayer = (layer: OverpassLayerType) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  const handleLayerColorChange = (layer: string, color: string) => {
    if (!map.current) return

    // Update Outer (Stroke)
    if (map.current.getLayer(`${layer}-outer`)) {
      map.current.setPaintProperty(`${layer}-outer`, 'circle-stroke-color', color)
    }
    // Update Inner (Fill)
    if (map.current.getLayer(`${layer}-inner`)) {
      map.current.setPaintProperty(`${layer}-inner`, 'circle-color', color)
    }
    // Update Poly (Fill)
    if (map.current.getLayer(`${layer}-poly`)) {
      map.current.setPaintProperty(`${layer}-poly`, 'fill-color', color)
      map.current.setPaintProperty(`${layer}-poly`, 'fill-outline-color', color)
    }
  }

  const handleLayerChange = (id: string, visible: boolean) => {
    // Update activeLayers state for all layers including animitas
    setActiveLayers(prev => ({ ...prev, [id]: visible }))
  }



  const handleResetView = () => {
    map.current?.fitBounds(CHILE_BOUNDS, {
      padding: 64,
      duration: 300
    })
    setShowProfileMarkers(false)
  }

  const handleExport = (format: string, scope?: 'viewport' | 'all') => {
    console.log('Exporting as:', format, 'Scope:', scope)
    // Mock export functionality
    const canvas = map.current?.getCanvas()
    if (canvas && format === 'image') {
      const link = document.createElement('a')
      link.download = `animita-map-${scope || 'view'}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      <SearchPanel
        onSearch={handleSearchChange}
        searchResults={searchSuggestions}
        onSelectResult={handleSelectLocation}
      />

      <LayersPanel
        onLayerChange={handleLayerChange}
        onPropertyToggle={handlePropertyToggle}
        activeProperties={activeProperties}
        onGISOperationSelect={handleGISOperation}
        elements={elements}
        onElementVisibilityChange={(id, visible) => setElements(prev => prev.map(e => e.id === id ? { ...e, visible } : e))}
        onElementRemove={(id) => setElements(prev => prev.filter(e => e.id !== id))}
      />


      <ActionsPanel
        onResetView={handleResetView}
        onExport={handleExport}
        disabled={isAtInitialView}
      />

      {nearestAnimita && (
        <div className="sr-only absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-sm border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Locate className="w-4 h-4 text-primary animate-pulse" />
          <div className="flex flex-col items-center">
            <span className="sr-only">
              Más cercana
            </span>
            <span
              className="text-base flex items-center gap-2 text-white"
              style={{ textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000' }}
            >
              {nearestAnimita.name}
              <span className="font-normal text-muted-foreground">
                ({Math.round(nearestAnimita.distance)}km)
              </span>
            </span>
          </div>
          <div
            className="w-6 h-6 flex items-center justify-center transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${nearestAnimita.bearing}deg)` }}
          >
            <ArrowUp className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  )
}
