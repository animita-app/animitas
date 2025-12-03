'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useRouter } from 'next/navigation'
import type { FeatureCollection, Point } from 'geojson'
import * as GeoJSON from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { SearchPanel } from './search'
import { ActiveAreaBanner } from './active-area-banner'
import { MarkerIcon } from './marker'
import { calculateDistance, calculateBearing } from '@/lib/utils'
import { useSpatialContext } from '@/contexts/spatial-context'
import { SEED_SITES } from '@/constants/sites'
import { fetchOverpassLayer, OverpassLayerType, fetchPlaceBoundary } from '@/lib/overpass-client'
import { Legend } from './layers/legend'
import { LayerDetail } from './layers/layer-detail'
import { AnimitaProperty, Layer, GISOperation, INITIAL_LAYERS } from './layers/types'
import { bufferFeatures, intersectFeatures, dissolveFeatures, clipFeatures, spatialJoin, GISOperationResult } from '@/lib/gis-engine'
import { Toolbar } from './toolbar'
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
    // Transporte
    highways: false,
    secondary_roads: false,
    urban_streets: false,
    dangerous_junctions: false,
    traffic_lights: false,
    roundabouts: false,

    // Servicios
    hospitals: false,
    cemeteries: false,
    police: false,
    fire_station: false,

    // Sociabilidad
    churches: false,
    schools: false,
    universities: false,
    bars: false,

    animitas: true,
    grutas: true
  })

  // Loaded Layers State (to avoid re-fetching)
  const [loadedLayers, setLoadedLayers] = useState<Set<string>>(new Set())

  // GIS & Elements State
  const [elements, setElements] = useState<Layer[]>([])
  const [gisResults, setGisResults] = useState<Record<string, FeatureCollection>>({})

  // Directional indicator state
  const [nearestAnimita, setNearestAnimita] = useState<{
    name: string
    distance: number
    bearing: number
  } | null>(null)

  // GIS Panel State
  const [activeTypologies, setActiveTypologies] = useState<string[]>(['gruta', 'iglesia', 'casa', 'cruz', 'orgánica', 'social', 'moderna', 'monumental'])
  const [activeDeathCauses, setActiveDeathCauses] = useState<string[]>(['accident', 'violence', 'illness', 'natural', 'unknown'])
  const [colorTheme, setColorTheme] = useState<'default' | 'neutral' | 'monochrome'>('default')
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [activeProperties, setActiveProperties] = useState<AnimitaProperty[]>(['typology', 'death_cause'])

  // Layers State
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS)
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null)

  // Spatial Context
  const { activeArea, activeAreaLabel, clearActiveArea } = useSpatialContext()

  // Handle Active Area on Map
  useEffect(() => {
    if (!map.current || !isMapReady) return

    const sourceId = 'active-area-source'
    const layerIdFill = 'active-area-fill'
    const layerIdLine = 'active-area-line'

    // Cleanup function to remove layers/source
    const cleanup = () => {
      if (map.current?.getLayer(layerIdFill)) map.current.removeLayer(layerIdFill)
      if (map.current?.getLayer(layerIdLine)) map.current.removeLayer(layerIdLine)
      if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId)
    }

    if (!activeArea) {
      console.log('No active area, cleaning up...')
      cleanup()
      return
    }
    console.log('Active area updated:', activeArea)

    // Add source
    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: activeArea
      })
    } else {
      (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(activeArea)
    }

    // Add layers
    // Only add fill layer, no outline/box
    if (!map.current.getLayer(layerIdFill)) {
      map.current.addLayer({
        id: layerIdFill,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0
        }
      })
    }

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds()

    const extendBounds = (geometry: any) => {
      if (geometry.type === 'Point') {
        bounds.extend(geometry.coordinates)
      } else if (geometry.type === 'Polygon') {
        geometry.coordinates[0].forEach((coord: any) => bounds.extend(coord))
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((poly: any) => {
          poly[0].forEach((coord: any) => bounds.extend(coord))
        })
      } else if (geometry.type === 'LineString') {
        geometry.coordinates.forEach((coord: any) => bounds.extend(coord))
      }
    }

    if (activeArea.type === 'FeatureCollection') {
      activeArea.features.forEach(f => extendBounds(f.geometry))
    } else {
      extendBounds(activeArea.geometry)
    }

    if (!bounds.isEmpty()) {
      // Delay fitting bounds to avoid jarring jump if loading
      setTimeout(() => {
        if (map.current) {
          map.current.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 2000, essential: true })
        }
      }, 500)
    }

  }, [activeArea, isMapReady])

  // Load/Save Layers
  useEffect(() => {
    const savedLayersStr = localStorage.getItem('animita-layers')
    if (savedLayersStr) {
      try {
        const savedLayers: Layer[] = JSON.parse(savedLayersStr)

        // Merge saved state with initial structure to ensure new components/layers appear
        const mergedLayers = INITIAL_LAYERS.map(initLayer => {
          const savedLayer = savedLayers.find(l => l.id === initLayer.id)
          if (savedLayer) {
            return {
              ...initLayer,
              visible: savedLayer.visible,
              opacity: savedLayer.opacity,
              color: savedLayer.color,
              // Force initial components for animitas to ensure new charts appear
              // For other layers, preserve saved components if any, or use initial
              components: initLayer.id === 'animitas' ? initLayer.components : (savedLayer.components || initLayer.components)
            }
          }
          return initLayer
        })

        setLayers(mergedLayers)
      } catch (e) {
        console.error('Failed to parse saved layers', e)
        // If error, fall back to initial layers (already set)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('animita-layers', JSON.stringify(layers))
  }, [layers])

  const handleLayerVisibilityChange = (id: string, isElement: boolean) => {
    if (isElement) {
      const element = elements.find(e => e.id === id)
      if (element) {
        const newVisibility = !element.visible
        setElements(prev => prev.map(e => e.id === id ? { ...e, visible: newVisibility } : e))

        // Update map visibility for element
        if (map.current && map.current.getLayer(id)) {
          map.current.setLayoutProperty(id, 'visibility', newVisibility ? 'visible' : 'none')
        }
        if (map.current && map.current.getLayer(`${id}-fill`)) {
          map.current.setLayoutProperty(`${id}-fill`, 'visibility', newVisibility ? 'visible' : 'none')
        }
        if (map.current && map.current.getLayer(`${id}-outline`)) {
          map.current.setLayoutProperty(`${id}-outline`, 'visibility', newVisibility ? 'visible' : 'none')
        }
      }
    } else {
      const layer = layers.find(l => l.id === id)
      if (layer) {
        const newVisibility = !layer.visible
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: newVisibility } : l))

        // Update map visibility
        if (map.current && map.current.getLayer(id)) {
          map.current.setLayoutProperty(id, 'visibility', newVisibility ? 'visible' : 'none')
        }

        // Handle specific layers

        // Handle context layers
        const contextLayers = [
          'churches', 'cemeteries', 'bars',
          'highways', 'secondary_roads', 'urban_streets', 'dangerous_junctions', 'traffic_lights', 'roundabouts',
          'hospitals', 'police', 'fire_station', 'schools', 'universities'
        ]

        if (contextLayers.includes(id)) {
          setActiveLayers(prev => ({ ...prev, [id]: newVisibility }))

          if (newVisibility && !loadedLayers.has(id)) {
            // Fetch data if not loaded
            const fetchLayer = async () => {
              try {
                // Map layer ID to Overpass ID if needed (currently they match mostly)
                // We need to cast id to OverpassLayerType, assuming they match
                // Special cases mapping if needed:
                let overpassId = id as OverpassLayerType
                if (id === 'churches') overpassId = 'iglesias'
                if (id === 'cemeteries') overpassId = 'cementerios'
                if (id === 'bars') overpassId = 'bares'
                if (id === 'hospitals') overpassId = 'hospitales'

                const data = await fetchOverpassLayer(overpassId, { south: -33.6, west: -70.8, north: -33.3, east: -70.5 }) // Default bbox for now or current view?

                if (map.current) {
                  const source = map.current.getSource(id) as mapboxgl.GeoJSONSource | undefined
                  if (source) {
                    source.setData(data)
                    setLoadedLayers(prev => new Set(prev).add(id))
                  }
                }
              } catch (err) {
                console.error(`Failed to fetch layer ${id}:`, err)
              }
            }
            fetchLayer()
          }

          // Toggle map layers
          if (['highways', 'secondary_roads', 'urban_streets'].includes(id)) {
            // Line layers
            if (map.current && map.current.getLayer(id)) {
              map.current.setLayoutProperty(id, 'visibility', newVisibility ? 'visible' : 'none')
            }
          } else {
            // Point layers (inner/outer)
            if (map.current && map.current.getLayer(`${id}-outer`)) {
              map.current.setLayoutProperty(`${id}-outer`, 'visibility', newVisibility ? 'visible' : 'none')
            }
            if (map.current && map.current.getLayer(`${id}-inner`)) {
              map.current.setLayoutProperty(`${id}-inner`, 'visibility', newVisibility ? 'visible' : 'none')
            }
          }
        }
        if (id === 'animitas') {
          setActiveLayers(prev => ({ ...prev, animitas: newVisibility }))
        }
      }
    }
  }

  const handleLayerUpdate = (updatedLayer: Layer) => {
    if (updatedLayer.source === 'search') {
      setElements(prev => prev.map(e => e.id === updatedLayer.id ? updatedLayer : e))
    } else {
      setLayers(prev => prev.map(l => l.id === updatedLayer.id ? updatedLayer : l))
    }
    setSelectedLayer(updatedLayer)

    // Update style if needed
    handleLayerColorChange(updatedLayer.id, updatedLayer.color)
  }

  const handleLayerSelect = (layer: Layer) => {
    setSelectedLayer(layer)
    handleLayerClick(layer)
  }

  // Heatmap State
  const [heatmapMetric, setHeatmapMetric] = useState<'income' | 'poverty'>('income')

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
      const contextSources = [
        'churches', 'cemeteries', 'bars',
        'highways', 'secondary_roads', 'urban_streets', 'dangerous_junctions', 'traffic_lights', 'roundabouts',
        'hospitals', 'police', 'fire_station', 'schools', 'universities'
      ]

      contextSources.forEach(source => {
        mapInstance.addSource(source, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      })

      // --- Overpass Layers ---

      // Helper to add point layers (inner/outer circles)
      const addPointLayer = (id: string, color: string) => {
        mapInstance.addLayer({
          id: `${id}-outer`,
          type: 'circle',
          source: id,
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': 5,
            'circle-color': 'transparent',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': color
          }
        })
        mapInstance.addLayer({
          id: `${id}-inner`,
          type: 'circle',
          source: id,
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': 2,
            'circle-color': color
          }
        })
      }

      // Helper to add line layers
      const addLineLayer = (id: string, color: string, width: number = 2) => {
        mapInstance.addLayer({
          id: id,
          type: 'line',
          source: id,
          layout: { visibility: 'none' },
          paint: {
            'line-color': color,
            'line-width': width
          }
        })
      }

      // Sociabilidad
      addPointLayer('churches', COLORS.context.churches)
      addPointLayer('bars', COLORS.context.bars)
      addPointLayer('schools', COLORS.context.schools)
      addPointLayer('universities', COLORS.context.universities)

      // Servicios
      addPointLayer('cemeteries', COLORS.context.cemeteries)
      addPointLayer('hospitals', COLORS.context.hospitals)
      addPointLayer('police', COLORS.context.police)
      addPointLayer('fire_station', COLORS.context.fire_station)

      // Transporte (Points)
      addPointLayer('dangerous_junctions', COLORS.context.dangerous_junctions)
      addPointLayer('traffic_lights', COLORS.context.traffic_lights)
      addPointLayer('roundabouts', COLORS.context.roundabouts)

      // Transporte (Lines)
      addLineLayer('highways', COLORS.context.highways, 3)
      addLineLayer('secondary_roads', COLORS.context.secondary_roads, 2)
      addLineLayer('urban_streets', COLORS.context.urban_streets, 1)

      // Keep cementerios-poly if needed, or remove it. User didn't specify polygons.
      // I'll leave it out for now to keep it clean as per "mini animitas" style request (points).

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

    // 2. Mapbox Geocoding with filtering
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&country=cl&language=es&bbox=-75.6,-56.0,-66.4,-17.5&types=place,locality,address,region,postcode&limit=5`
      )
      const data = await response.json()
      // Exclude plain address results; keep places, regions, localities, and highways (if category includes highway)
      const filteredFeatures = (data.features || []).filter((f: any) => {
        const types = f.place_type || []
        // Exclude if it's an address and not a road/highway
        if (types.includes('address')) {
          const categories = f.properties?.category || ''
          return /highway|road/i.test(categories)
        }
        return true
      })
      const mapboxResults = filteredFeatures.map((f: any) => ({
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

  const handleSelectLocation = async (location: any) => {
    if (!map.current || !location) return

    // 1. Handle 'local' (Animitas) - Just focus, no highlight layer
    if (location.type === 'local') {
      focusMemorial(location.id, location.center)
      setSearchSuggestions([])
      return
    }

    // Use centralized color for search elements
    const elementColor = COLORS.searchElements

    // 2. Handle 'mapbox' (Places) - Try to get boundary
    let geometry = location.geometry
    let geometryType: 'point' | 'polygon' | 'line' = location.geometry?.type === 'Point' ? 'point' : 'polygon'
    let finalLocation = { ...location }
    let usedBoundary = false

    if (location.type === 'mapbox') {
      // Try to fetch boundary
      const boundary = await fetchPlaceBoundary(location.title)
      if (boundary) {
        geometry = boundary.geometry
        geometryType = 'polygon'
        finalLocation = { ...location, geometry: boundary.geometry }
        usedBoundary = true
      }
    }

    console.log('Selected Location:', location)
    if (!usedBoundary && location.bbox) {
      console.log('BBox:', location.bbox)
      // Create a Polygon from the BBox
      const [minLng, minLat, maxLng, maxLat] = location.bbox
      geometry = {
        type: 'Polygon',
        coordinates: [[
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ]]
      }
      geometryType = 'polygon'
      finalLocation = { ...location, geometry }

      map.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        {
          padding: 50,
          maxZoom: 16,
          essential: true
        }
      )
    } else if (!usedBoundary) { // If no boundary and no bbox, just fly to center
      const [lng, lat] = location.center
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14, // Zoom in closer to see layers
        essential: true
      })
    } else { // If boundary was used, fit to its bounds
      if (geometry && geometry.type === 'Polygon') {
        const bounds = new mapboxgl.LngLatBounds();
        (geometry as GeoJSON.Polygon).coordinates[0].forEach(coord => {
          bounds.extend(coord as [number, number]);
        });
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
          essential: true
        });
      } else if (geometry && geometry.type === 'Point') {
        map.current.flyTo({
          center: geometry.coordinates as [number, number],
          zoom: 14,
          essential: true
        });
      }
    }

    // Add to elements list
    const newElement: Layer = {
      id: location.id,
      label: location.title || location.place_name,
      type: 'analysis',
      geometry: geometryType,
      color: elementColor,
      visible: true,
      opacity: 100,
      source: 'search',
      data: finalLocation
    }
    setElements(prev => [...prev, newElement])

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
        // Ensure site has valid location
        return site.location && typeof site.location.lat === 'number' && typeof site.location.lng === 'number'
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

    // Also toggle heatmap if that's the ID
    if (id === 'heatmap') {
      setShowHeatmap(visible)
    }
  }

  const handleResetView = () => {
    map.current?.fitBounds(CHILE_BOUNDS, {
      padding: 64,
      duration: 1500,
      essential: true
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

  const handleLayerClick = (layer: Layer) => {
    if (!map.current) return

    // If it's a search element, we have location data
    if (layer.source === 'search' && layer.data) {
      const location = layer.data
      if (location.bbox) {
        map.current.fitBounds(
          [
            [location.bbox[0], location.bbox[1]],
            [location.bbox[2], location.bbox[3]]
          ],
          { padding: 50, maxZoom: 16, essential: true }
        )
      } else if (location.center) {
        const [lng, lat] = location.center
        map.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true
        })
      }
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <Legend
            layers={layers}
            elements={elements}
            selectedLayerId={selectedLayer?.id}
            onLayerClick={handleLayerSelect}
            onToggleVisibility={handleLayerVisibilityChange}
          />
        </div>

        {/* Active Area Banner */}
        <ActiveAreaBanner
          label={activeAreaLabel}
          onClear={() => {
            console.log('Clearing active area...')
            clearActiveArea()
            console.log('Resetting view...')
            handleResetView()
          }}
        />

        <div className="pointer-events-auto">
          {selectedLayer ? (
            <LayerDetail
              selectedLayer={selectedLayer}
              onClose={() => setSelectedLayer(null)}
              onUpdateLayer={handleLayerUpdate}
              activeProperties={activeProperties}
              onPropertyToggle={handlePropertyToggle}
              onGISOperationSelect={handleGISOperation}
              onElementRemove={(id) => {
                setElements(prev => prev.filter(e => e.id !== id))
                setSelectedLayer(null)
                // Remove from map
                if (map.current) {
                  if (map.current.getLayer(id)) map.current.removeLayer(id)
                  if (map.current.getLayer(`${id}-fill`)) map.current.removeLayer(`${id}-fill`)
                  if (map.current.getLayer(`${id}-outline`)) map.current.removeLayer(`${id}-outline`)
                  if (map.current.getSource(id)) map.current.removeSource(id)
                }
              }}
            />
          ) : (
            <SearchPanel
              onSearch={handleSearchChange}
              searchResults={searchSuggestions}
              onSelectResult={handleSelectLocation}
            />
          )}
        </div>

        <Toolbar
          onResetView={handleResetView}
          onToggleProfile={() => {
            setShowProfileMarkers(!showProfileMarkers)
            profileViewState.current = !showProfileMarkers
          }}
          showProfile={showProfileMarkers}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}
