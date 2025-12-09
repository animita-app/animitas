'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { useRouter } from 'next/navigation'
import { MapLayout } from '@/layouts/map-layout'
import { useMapInitialization, CHILE_BOUNDS } from './hooks/useMapInitialization'
import { useActiveArea } from './hooks/useActiveArea'
import { useOverpassData } from './hooks/useOverpassData'
import { useLayerManagement } from './hooks/useLayerManagement'
import { useMapEvents } from './hooks/useMapEvents'
import { useHeritageSiteSelection } from '@/hooks/use-heritage-site-selection'
import { useVisibleSites } from '@/hooks/use-visible-sites'
import { useCruiseMode } from '@/hooks/use-cruise-mode'
import { useSpatialAudio } from '@/hooks/use-spatial-audio'
import { HeritageSiteProperty, GISOperation } from '../paywall/types'
import { searchLocation } from '@/lib/mapbox'
import { MapMarker } from './map-marker'
import { MarkerLayer } from './layers/marker-layer'
import { COLORS } from '@/lib/map-style'
import { HeritageSite } from '@/types/mock'
import { PrefaceDialog } from '@/components/modals/preface-dialog'
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'

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
  // @ts-ignore
  const { activeArea, activeAreaLabel, clearActiveArea, setSyntheticSites, filteredData, isCruiseActive, setCruiseActive } = useSpatialContext()

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
  const [showPreface, setShowPreface] = useState(true)
  const [hasMoved, setHasMoved] = useState(false)

  const { role } = useUser()
  const isFree = role === ROLES.FREE

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

  // Track Zoom Level & User Movement
  const initialViewState = useRef<{ zoom: number, center: { lng: number, lat: number } } | null>(null)

  useEffect(() => {
    if (!map.current || !isMapReady) return

    // Capture initial state
    if (!initialViewState.current) {
      const center = map.current.getCenter()
      initialViewState.current = {
        zoom: map.current.getZoom(),
        center: { lng: center.lng, lat: center.lat }
      }
    }

    const updateZoom = () => setCurrentZoom(map.current!.getZoom())

    const checkMovement = () => {
      if (!initialViewState.current) return

      const currentZoom = map.current!.getZoom()
      const currentCenter = map.current!.getCenter()

      const isZoomSame = Math.abs(currentZoom - initialViewState.current.zoom) < 0.5
      const isCenterSame = Math.abs(currentCenter.lng - initialViewState.current.center.lng) < 0.1 &&
        Math.abs(currentCenter.lat - initialViewState.current.center.lat) < 0.1

      setHasMoved(!isZoomSame || !isCenterSame)
    }

    map.current.on('zoom', updateZoom)
    map.current.on('moveend', checkMovement)
    // Also check on zoomend since moveend might not fire for pure pinch-zoom sometimes? Usually it does.

    updateZoom()

    return () => {
      map.current?.off('zoom', updateZoom)
      map.current?.off('moveend', checkMovement)
    }
  }, [isMapReady])



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
  const { focusHeritageSite, resetView } = useMapEvents({
    map: map.current,
    isMapReady,
    focusedHeritageSiteId: selectedHeritageSite?.id || null,

    // onHeritageSiteClick is now handled by HeritageMarkerLayer
    onLayerClick: (layerId, feature) => {
      // Find the layer object
      const layer = layers.find(l => l.id === layerId)
      if (layer) {
        handleLayerSelect(layer)
      }
    }
  })

  // 8. Cruise Mode & Audio
  const { startCruise, stopCruise, skipToNext, skipToPrevious, activeCruiseSite } = useCruiseMode({
    map: map.current,
    sites: filteredData,
    onSiteExamine: (site) => {
      // Optional: Open popover automatically?
      handleHeritageSiteSelect(site)
    }
  })

  useEffect(() => {
    if (isCruiseActive) {
      startCruise()
    } else {
      stopCruise()
    }
  }, [isCruiseActive, startCruise, stopCruise])

  // Arrow key navigation for cruise mode
  useEffect(() => {
    if (!isCruiseActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        skipToNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        skipToPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCruiseActive, skipToNext, skipToPrevious])

  // Stop Cruise on User Interaction
  useEffect(() => {
    if (!map.current || !isMapReady) return

    const stopInteraction = () => {
      setCruiseActive(false)
    }

    const m = map.current
    // Listen to user interactions to stop cruise mode
    m.on('mousedown', stopInteraction) // Mouse click/drag
    m.on('touchstart', stopInteraction) // Touch
    m.on('wheel', stopInteraction) // Zoom/Scroll
    m.on('dragstart', stopInteraction) // Explicit drag

    return () => {
      m.off('mousedown', stopInteraction)
      m.off('touchstart', stopInteraction)
      m.off('wheel', stopInteraction)
      m.off('dragstart', stopInteraction)
    }
  }, [isMapReady, setCruiseActive])

  useSpatialAudio({
    map: map.current,
    sites: filteredData,
    mode: !isFree
      ? 'disabled'
      : showPreface
        ? 'preface'
        : isCruiseActive
          ? 'cruise'
          : selectedHeritageSite
            ? 'focused'
            : 'interactive'
  })

  // Handlers
  const handleMarkerClick = (id: string) => {
    const site = filteredData.find((s: HeritageSite) => s.id === id)
    if (!site) return

    // Always select and focus, let user click card to navigate
    handleHeritageSiteSelect(site)
    focusHeritageSite(
      site.id,
      [site.location.lng, site.location.lat],
      { shouldNavigate: false, instant: false }
    )
    setHasMoved(true)
  }

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
    setHasMoved(true)
  }

  const handleResetView = () => {
    resetView()
    setHasMoved(false)
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

      <MarkerLayer
        map={map.current}
        isMapReady={isMapReady}
        data={filteredData}
        onSiteClick={handleMarkerClick}
        currentZoom={currentZoom}
        visibleSites={visibleSites}
        selectedSite={selectedHeritageSite}
        onSiteSelect={handleHeritageSiteSelect}
      />

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
        hasMoved={hasMoved}
        onSearchLoading={setIsSearching}

        activeCruiseSite={activeCruiseSite}
        onCruiseNext={skipToNext}
        onCruisePrevious={skipToPrevious}
        onStopCruise={stopCruise}
      />

      {/* Preface Dialog for Free Users */}
      {isFree && (
        <PrefaceDialog
          open={showPreface}
          onOpenChange={setShowPreface}
        />
      )}
    </div>
  )
}
