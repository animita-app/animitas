import { useState } from 'react'
import { Search as SearchIcon, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LayerItem } from './layers/layer-item'
import { Layer } from './layers/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { COLORS } from '@/lib/map-style'
import { useSpatialContext } from '@/contexts/spatial-context'
import { Feature, Geometry } from 'geojson'
import { formatPlaceName } from '@/lib/format-place'
import { fetchPlaceBoundary } from '@/lib/overpass-client'

interface SearchPanelProps {
  className?: string
  onSearch?: (query: string) => void
  searchResults?: any[]
  onSelectResult?: (result: any) => void
}

export function SearchPanel({ onSearch, searchResults = [], onSelectResult }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
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
    onSelectResult?.(result)

    // Create a feature from the result for the active area
    let geometry: Geometry | null = null

    if (result.bbox) {
      // Try to fetch precise boundary
      fetchPlaceBoundary(result.place_name || result.title).then(boundary => {
        if (boundary) {
          const feature: Feature<Geometry> = {
            type: 'Feature',
            geometry: boundary.geometry,
            properties: result
          }
          const label = formatPlaceName(result.title || result.place_name || 'Área seleccionada')
          setActiveArea(feature, label)
        } else {
          // Fallback to bbox polygon if boundary fetch fails
          const [minLng, minLat, maxLng, maxLat] = result.bbox
          const geometry: Geometry = {
            type: 'Polygon',
            coordinates: [[
              [minLng, minLat],
              [maxLng, minLat],
              [maxLng, maxLat],
              [minLng, maxLat],
              [minLng, minLat]
            ]]
          }
          const feature: Feature<Geometry> = {
            type: 'Feature',
            geometry,
            properties: { ...result, isBbox: true }
          }
          const label = formatPlaceName(result.title || result.place_name || 'Área seleccionada')
          setActiveArea(feature, label)
        }
      })

      // Clear search immediately
      setSearchQuery('')
      onSearch?.('')
      setOpen(false)
      return // Exit early as we handle setActiveArea async
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
    <Card className="absolute right-4 top-4 z-10 flex flex-col gap-2 w-80 shadow-md border border-border-weak !p-0">
      <Popover open={open && searchResults.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent border-none focus:outline-none pl-9 pr-8 text-sm h-9"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => { if (searchQuery.length >= 3) setOpen(true) }}
            />
            {searchQuery && (
              <button onClick={handleClearSearch} className="[&_svg]:size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <XCircle />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 overflow-y-hidden" align="start" sideOffset={8} onOpenAutoFocus={(e) => e.preventDefault()}>
          <ScrollArea className="max-h-48 p-1">
            <div className="flex flex-col gap-1">
              {searchResults.map((result) => {
                let geometryType: 'point' | 'line' | 'polygon' = 'point'
                if (result.geometry?.type === 'Polygon' || result.geometry?.type === 'MultiPolygon') geometryType = 'polygon'
                else if (result.geometry?.type === 'LineString' || result.geometry?.type === 'MultiLineString') geometryType = 'line'
                else if (result.bbox) geometryType = 'polygon'

                const layer: Layer = {
                  id: result.id,
                  label: formatPlaceName(result.title),
                  type: 'data',
                  geometry: geometryType,
                  color: result.type === 'local' ? COLORS.animitas : '#6b7280',
                  visible: true,
                  opacity: 1,
                }
                return (
                  <LayerItem key={result.id} layer={layer} isSearchResult={true} onClick={() => handleSelect(result)} onToggleVisibility={(e) => { e.stopPropagation() }} />
                )
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </Card>
  )
}
