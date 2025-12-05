'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { useRouter } from 'next/navigation'
import { MapLayout } from '@/layouts/map-layout'
import { useMapInitialization } from './hooks/useMapInitialization'
import { useActiveArea } from './hooks/useActiveArea'
import { useOverpassData } from './hooks/useOverpassData'
import { useLayerManagement } from './hooks/useLayerManagement'
import { useMapEvents } from './hooks/useMapEvents'
import { useHeritageSiteSelection } from '@/hooks/use-heritage-site-selection'
import { useVisibleSites } from '@/hooks/use-visible-sites'
import { HeritageSiteProperty, GISOperation } from '../paywall/types'
import { searchLocation } from '@/lib/mapbox'
import { MapMarker } from './map-marker'
import { HeritageSiteDetailPopover } from './heritage-site-detail-popover'
import { COLORS } from '@/lib/map-style'
import { HeritageSite } from '@/types/mock'

interface MapboxMapProps {
  accessToken: string
  style?: string
  focusedHeritageSiteId?: string | null
  isModal?: boolean
  onAnalysisRequested?: (data: any) => void
  onHeritageSiteSelect?: (site: HeritageSite | null) => void
  selectedHeritageSite?: HeritageSite | null
}

export default function MapboxMap({
  accessToken,
  style,
  focusedHeritageSiteId,
  onAnalysisRequested,
  onHeritageSiteSelect,
  selectedHeritageSite: propSelectedHeritageSite
}: MapboxMapProps) {
  // Constants
  const HIGH_ZOOM_THRESHOLD = 10

  // Spatial Context
  // @ts-ignore
  const { activeArea, activeAreaLabel, clearActiveArea, setSyntheticSites, filteredData } = useSpatialContext()

  // Map Initialization
  const { mapContainer, map, isMapReady } = useMapInitialization({ accessToken, style })

  // Heritage Site Selection
  const { selectedHeritageSite, handleHeritageSiteSelect } = useHeritageSiteSelection({
    onHeritageSiteSelect,
    selectedHeritageSite: propSelectedHeritageSite
  })

  // UI State
  const [showProfileMarkers, setShowProfileMarkers] = useState(false)
  const [activeProperties, setActiveProperties] = useState<HeritageSiteProperty[]>(['typology', 'death_cause'])
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [currentZoom, setCurrentZoom] = useState<number>(0)
  const [isSearching, setIsSearching] = useState(false)

  // Track Visible Sites at High Zoom
  const visibleSites = useVisibleSites({
    map: map.current,
    isMapReady,
    currentZoom,
    zoomThreshold: HIGH_ZOOM_THRESHOLD,
    filteredData,
    maxVisibleSites: 20
  })

  // Sync focusedHeritageSiteId prop with selection
  useEffect(() => {
    if (focusedHeritageSiteId && filteredData.length > 0) {
      const site = filteredData.find((s: HeritageSite) => s.id === focusedHeritageSiteId)
      if (site) {
        handleHeritageSiteSelect(site)
      }
    }
  }, [focusedHeritageSiteId, filteredData, handleHeritageSiteSelect])

  // Track Zoom Level
  useEffect(() => {
    if (!map.current) return
    const updateZoom = () => setCurrentZoom(map.current!.getZoom())
    map.current.on('zoom', updateZoom)
    updateZoom()
    return () => {
      map.current?.off('zoom', updateZoom)
    }
  }, [isMapReady])

  // Update Memorials Source with Filtered Data
  useEffect(() => {
    if (!map.current || !isMapReady) return

    const source = map.current.getSource('memorials') as mapboxgl.GeoJSONSource
    if (source) {
      const geojson = {
        type: 'FeatureCollection',
        features: filteredData.map((site: HeritageSite) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [site.location.lng, site.location.lat]
          },
          properties: site
        }))
      }
      source.setData(geojson as any)
    }
  }, [isMapReady, filteredData, map])

  // 2. Active Layers State (kept here as it's shared between Overpass and LayerManagement)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    // Transporte
    highways: false,
    urban_streets: false,
    traffic_lights: false,
    critical_points: false,

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

  // 3. Loaded Layers State
  const [loadedLayers, setLoadedLayers] = useState<Set<string>>(new Set())

  // 4. Layer Management
  const {
    layers,
    elements,
    selectedLayer,
    setSelectedLayer,
    handleLayerVisibilityChange,
    handleLayerUpdate,
    handleLayerSelect
  } = useLayerManagement({ map: map.current, setActiveLayers })

  // 5. Active Area Handling
  useActiveArea({ map: map.current, isMapReady, activeArea })

  // 6. Overpass Data Fetching
  const { isLoading } = useOverpassData({
    map: map.current,
    activeLayers,
    loadedLayers,
    setLoadedLayers
  })

  // 7. Map Events (Zoom, Focus)
  const router = useRouter()
  const { focusHeritageSite } = useMapEvents({
    map: map.current,
    isMapReady,
    focusedHeritageSiteId: selectedHeritageSite?.id || null,
    onHeritageSiteClick: (id) => {
      const site = filteredData.find((s: HeritageSite) => s.id === id)
      if (!site) return

      const zoom = map.current?.getZoom() || 0

      if (zoom >= HIGH_ZOOM_THRESHOLD) {
        // High zoom: Redirect to detail page
        const kind = (site as any).kind || 'animita'
        const slug = site.slug || site.id
        router.push(`/${kind}/${slug}`)
      } else {
        // Normal zoom: Select site AND zoom to it
        handleHeritageSiteSelect(site)
        focusHeritageSite(
          site.id,
          [site.location.lng, site.location.lat],
          { shouldNavigate: false, instant: false }
        )
      }
    },
    onLayerClick: (layerId, feature) => {
      // Find the layer object
      const layer = layers.find(l => l.id === layerId)
      if (layer) {
        handleLayerSelect(layer)
      }
    }
  })

  // Handlers
  const handleProfileToggle = () => setShowProfileMarkers(prev => !prev)

  const handlePropertyToggle = (property: HeritageSiteProperty, visible: boolean) => {
    if (visible) {
      setActiveProperties(prev => [...prev, property])
    } else {
      setActiveProperties(prev => prev.filter(p => p !== property))
    }
  }

  const handleGISOperationSelect = (operation: GISOperation) => {
    // GIS Operation logic
  }

  const handleElementRemove = (id: string) => {
    // Implement element removal logic if needed, or pass to layer management
  }

  const handleCloseLayerDetail = () => {
    setSelectedLayer(null)
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([])
      return
    }

    // 1. Search Local Data (Heritage Sites)
    const localResults = filteredData
      .filter((site: HeritageSite) =>
        site.title.toLowerCase().includes(query.toLowerCase()) ||
        site.typology?.toLowerCase().includes(query.toLowerCase())
      )
      .map((site: HeritageSite) => ({
        id: site.id,
        title: site.title,
        type: 'local',
        center: [site.location.lng, site.location.lat],
        geometry: { type: 'Point', coordinates: [site.location.lng, site.location.lat] }
      }))

    // 2. Search Mapbox
    const mapboxResults = await searchLocation(query, accessToken)

    const filteredMapboxResults = mapboxResults.filter((result: any) => {
      const isBoundary = result.place_type.some((t: string) =>
        ['region', 'district', 'place', 'locality', 'neighborhood'].includes(t)
      )
      const isMotorway = /autopista|ruta|camino|carretera|corredor|vía|costanera|peaje|tunel/i.test(result.text)

      return isBoundary || isMotorway
    })

    setSearchSuggestions([...localResults, ...filteredMapboxResults])
  }

  const handleSelectResult = (location: any) => {
    if (!map.current) return

    // If result has a bounding box, fit to it
    if (location.bbox) {
      map.current.fitBounds(
        [
          [location.bbox[0], location.bbox[1]], // sw
          [location.bbox[2], location.bbox[3]]  // ne
        ],
        { padding: 50, essential: true }
      )
    } else {
      // Otherwise fly to center
      const [lng, lat] = location.center
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true
      })
    }
    setSearchSuggestions([])
  }

  const handleResetView = () => {
    if (!map.current) return
    map.current.fitBounds(
      [
        [-75.6, -56.0],
        [-66.4, -17.5]
      ],
      {
        padding: 64,
        essential: true,
        duration: 600
      }
    )
  }

  const handleExport = (format: string, scope?: 'viewport' | 'all') => {
    // Export logic
  }
  const handleGenerateSynthetic = () => {
    setSyntheticSites([]) // Mock implementation
  }

  return (
    <div className="relative w-full h-full pointer-events-auto">
      <div ref={mapContainer} className="absolute inset-0 pointer-events-auto" />

      {/* Render Selected Marker */}
      {/* Render Selected Marker OR High Zoom Markers */}
      {map.current && (
        <>
          {(currentZoom >= HIGH_ZOOM_THRESHOLD ? visibleSites : (selectedHeritageSite ? [selectedHeritageSite] : []))
            .map((site) => (
              <MapMarker
                key={site.id}
                map={map.current!}
                coordinates={[site.location.lng, site.location.lat]}
              >
                <HeritageSiteDetailPopover
                  heritageSite={site}
                  open={currentZoom >= HIGH_ZOOM_THRESHOLD}
                  onClose={() => handleHeritageSiteSelect?.(null)}
                />
              </MapMarker>
            ))}
        </>
      )}

      {(isLoading || isSearching) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-muted/60 animate-pulse pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <MapLayout
        layers={layers}
        elements={elements}
        selectedLayer={selectedLayer}
        onLayerVisibilityChange={handleLayerVisibilityChange}
        onLayerUpdate={handleLayerUpdate}
        onLayerSelect={handleLayerSelect}
        onToggleProfile={handleProfileToggle}
        onExport={handleExport}
        onGenerateSynthetic={handleGenerateSynthetic}

        activeAreaLabel={activeAreaLabel}
        activeProperties={activeProperties}
        searchSuggestions={searchSuggestions}
        showProfileMarkers={showProfileMarkers}
        onClearActiveArea={clearActiveArea}
        // @ts-ignore
        onPropertyToggle={handlePropertyToggle}
        onGISOperationSelect={handleGISOperationSelect}
        onElementRemove={handleElementRemove}
        onCloseLayerDetail={handleCloseLayerDetail}
        onSearch={handleSearch}
        onSelectResult={handleSelectResult}
        onResetView={handleResetView}
        onSearchLoading={setIsSearching}
      />
    </div>
  )
}
