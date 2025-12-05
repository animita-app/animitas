
import { useState } from 'react'
import { Search as SearchIcon, XCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LayerItem } from '../map/layers/layer-item'
import { Layer } from './types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { COLORS } from '@/lib/map-style'
import { useSpatialContext } from '@/contexts/spatial-context'
import { Feature, Geometry } from 'geojson'
import { formatPlaceName } from '@/lib/format-place'
import { fetchPlaceBoundary } from '@/lib/boundary-service'

interface SearchPanelProps {
  className?: string
  onSearch?: (query: string) => void
  searchResults?: any[]
  onSelectResult?: (result: any) => void
  onLoadingChange?: (loading: boolean) => void
}

export function SearchPanel({ onSearch, searchResults = [], onSelectResult, onLoadingChange }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setActiveArea } = useSpatialContext()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)

    if (query.length >= 3) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleSelect = (result: any) => {
    // Removed immediate onSelectResult to prevent early zoom
    // onSelectResult?.(result)

    setIsLoading(true)

    // Create a feature from the result for the active area
    let geometry: Geometry | null = null

    if (result.bbox) {

      // 1. Optimistic UI: Set active area immediately using bbox
      const [minLng, minLat, maxLng, maxLat] = result.bbox
      const bboxGeometry: Geometry = {
        type: 'Polygon',
        coordinates: [[
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ]]
      }
      const label = formatPlaceName(result.title || result.place_name || 'Área seleccionada')

      const bboxFeature: Feature<Geometry> = {
        type: 'Feature',
        geometry: bboxGeometry,
        properties: { ...result, isBbox: true }
      }

      setActiveArea(bboxFeature, label)

      // 2. Fetch precise boundary in background
      // Don't block UI loading state on this refinement
      setIsLoading(false)

      fetchPlaceBoundary(result.place_name || result.title).then(boundary => {
        if (boundary) {
          const feature: Feature<Geometry> = {
            type: 'Feature',
            geometry: boundary.geometry,
            properties: { ...result, isBbox: false }
          }

          // Update with precise boundary
          setActiveArea(feature, label)
        }
      }).catch(() => {
        // limit error handling
      })

      // Clear search immediately
      setSearchQuery('')
      onSearch?.('')
      setOpen(false)
      return
    } else if (result.geometry) {
      geometry = result.geometry
    } else if (result.center) {
      geometry = {
        type: 'Point',
        coordinates: result.center
      }
    }

    if (geometry) {
      const feature: Feature<Geometry> = {
        type: 'Feature',
        geometry,
        properties: result
      }
      const label = formatPlaceName(result.title || result.place_name || 'Área seleccionada')
      setActiveArea(feature, label)
    }

    setIsLoading(false)
    setSearchQuery('')
    onSearch?.('')
    setOpen(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    onSearch?.('')
    setOpen(false)
  }

  return (
    <Card className="flex flex-col gap-2 w-80 shadow-xs border border-border-weak !p-0 pointer-events-auto">
      <Popover open={open && searchResults.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            {isLoading ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <input
              className="w-full bg-transparent border-none focus:outline-none pl-9 pr-8 text-sm h-9"
              placeholder={isLoading ? "Cargando..." : "Buscar..."}
              value={searchQuery}
              onChange={handleSearch}
              disabled={isLoading}
              onFocus={() => { if (searchQuery.length >= 3) setOpen(true) }}
            />
            {searchQuery && !isLoading && (
              <button onClick={handleClearSearch} className="cursor-pointer [&_svg]:size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <XCircle />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="max-h-48 w-80 p-0 overflow-y-hidden" align="start" sideOffset={8} onOpenAutoFocus={(e) => e.preventDefault()}>
          <ScrollArea className="max-h-48 p-1 space-y-1">
            {searchResults.map((result) => {
              let geometryType: 'point' | 'line' | 'polygon' = 'point'
              if (result.geometry?.type === 'Polygon' || result.geometry?.type === 'MultiPolygon') geometryType = 'polygon'
              else if (result.geometry?.type === 'LineString' || result.geometry?.type === 'MultiLineString') geometryType = 'line'
              else if (result.bbox) geometryType = 'polygon'

              const layer: Layer = {
                id: result.id,
                label: formatPlaceName(result.title || result.text || result.place_name),
                type: 'data',
                geometry: geometryType,
                color: result.type === 'local' ? COLORS.animitas : COLORS.searchElements,
                visible: true,
                opacity: 100,
                source: 'search',
              }
              return (
                <LayerItem key={result.id} layer={layer} isSearchResult={true} onClick={() => handleSelect(result)} onToggleVisibility={(e) => { e.stopPropagation() }} />
              )
            })}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </Card>
  )
}
