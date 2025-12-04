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
import { AnimitaProperty, GISOperation } from '../paywall/types'
import { searchLocation } from '@/lib/mapbox'
import { MapMarker } from './map-marker'
import { SiteDetailPopover } from './site-detail-popover'
import { COLORS } from '@/lib/map-style'

interface MapboxMapProps {
  accessToken: string
  style?: string
  focusedMemorialId?: string | null
  isModal?: boolean
  onAnalysisRequested?: (data: any) => void
}

export default function MapboxMap({ accessToken, style, focusedMemorialId, onAnalysisRequested }: MapboxMapProps) {
  // Spatial Context
  // @ts-ignore
  const { activeArea, activeAreaLabel, clearActiveArea, setSyntheticSites, filteredData } = useSpatialContext()

  // 1. Map Initialization
  const { mapContainer, map, isMapReady } = useMapInitialization({ accessToken, style })

  // State for UI
  const [showProfileMarkers, setShowProfileMarkers] = useState(false)
  const [activeProperties, setActiveProperties] = useState<AnimitaProperty[]>(['typology', 'death_cause'])
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [selectedMemorialId, setSelectedMemorialId] = useState<string | null>(focusedMemorialId || null)
  const [currentZoom, setCurrentZoom] = useState<number>(0)

  // Sync prop with state
  useEffect(() => {
    if (focusedMemorialId) setSelectedMemorialId(focusedMemorialId)
  }, [focusedMemorialId])

  // Track Zoom Level
  useEffect(() => {
    if (!map.current) return
    const updateZoom = () => setCurrentZoom(map.current!.getZoom())
    map.current.on('zoom', updateZoom)
    updateZoom() // Initial check
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
        features: filteredData.map((site: any) => ({
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
  const { focusMemorial } = useMapEvents({
    map: map.current,
    focusedMemorialId: selectedMemorialId,
    onMemorialClick: (id) => {
      setSelectedMemorialId(id)
      // Optional: focus map on click
      const site = filteredData.find((s: any) => s.id === id)
      if (site) {
        focusMemorial(id, [site.location.lng, site.location.lat], { shouldNavigate: false })
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

  const handlePropertyToggle = (property: AnimitaProperty, visible: boolean) => {
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

    // 1. Search Local Data (Animitas)
    const localResults = filteredData
      .filter((site: any) =>
        site.title.toLowerCase().includes(query.toLowerCase()) ||
        site.typology?.toLowerCase().includes(query.toLowerCase())
      )
      .map((site: any) => ({
        id: site.id,
        title: site.title,
        type: 'local',
        center: [site.location.lng, site.location.lat],
        geometry: { type: 'Point', coordinates: [site.location.lng, site.location.lat] }
      }))
      .slice(0, 5)

    // 2. Search Mapbox
    const mapboxResults = await searchLocation(query, accessToken)

    setSearchSuggestions([...localResults, ...mapboxResults])
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
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Render Selected Marker */}
      {selectedMemorialId && map.current && (() => {
        const site = filteredData.find((s: any) => s.id === selectedMemorialId)
        if (!site) return null



        return (
          <MapMarker map={map.current} coordinates={[site.location.lng, site.location.lat]}>
            <SiteDetailPopover
              site={site}
              open={currentZoom >= 12}
            />
          </MapMarker>
        )
      })()}

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-muted-60 animate-pulse">
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

        // Missing props
        activeAreaLabel={activeAreaLabel}
        activeProperties={activeProperties}
        searchSuggestions={searchSuggestions}
        showProfileMarkers={showProfileMarkers}
        onClearActiveArea={clearActiveArea}
        onPropertyToggle={handlePropertyToggle}
        onGISOperationSelect={handleGISOperationSelect}
        onElementRemove={handleElementRemove}
        onCloseLayerDetail={handleCloseLayerDetail}
        onSearch={handleSearch}
        onSelectResult={handleSelectResult}
        onResetView={handleResetView}
      />
    </div>
  )
}
