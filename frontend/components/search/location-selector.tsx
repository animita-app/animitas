'use client'

import { useRef, useEffect, useState } from 'react'
import { MapPin, X, Check, Search as SearchIcon } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayerItem } from '@/components/map/layers/layer-item'
import { Layer } from '@/components/map/types'
import { COLORS } from '@/lib/map-style'
import { cn } from '@/lib/utils'
import { reverseGeocode } from '@/lib/mapbox'

export interface Location {
  id: string
  coords: [number, number]
  address: string
  region?: string
  country: string
  source: 'search' | 'manual'
}

interface SearchResult {
  id: string | number
  place_name: string
  center?: [number, number]
  text: string
  title?: string
  type?: 'local' | 'mapbox'
  locationType?: 'point' | 'region'
}

interface LocationSelectorProps {
  value: Location[]
  onChange: (locations: Location[]) => void
  onSearch?: (query: string) => void
  searchResults?: SearchResult[]
  isLoading?: boolean
  panelWidth?: number
  placeholder?: string
}

type Mode = 'search' | 'map'

const DEFAULT_SUGGESTIONS = [
  { id: 'current', place_name: 'Ubicación actual', text: 'Tu posición', locationType: 'point' as const, isCurrent: true },
  { id: 'metro', place_name: 'Región Metropolitana', text: 'Metropolitan Region', locationType: 'region' as const },
  { id: 'lareina', place_name: 'La Reina, Región Metropolitana', text: 'La Reina', locationType: 'point' as const },
  { id: 'vinadel', place_name: 'Viña del Mar, Región de Valparaíso', text: 'Viña del Mar', locationType: 'point' as const },
]

export function LocationSelector({
  value,
  onChange,
  onSearch,
  searchResults = [],
  isLoading = false,
  panelWidth = 320,
  placeholder = 'Buscar ubicación...',
}: LocationSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

  const [mode, setMode] = useState<Mode>('search')
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [mapPin, setMapPin] = useState<[number, number] | null>(value[0]?.coords || null)
  const [selectedRegions, setSelectedRegions] = useState<Set<string | number>>(new Set())

  const handleInputChange = (val: string) => {
    console.log('handleInputChange:', val)
    setInputValue(val)
    onSearch?.(val)
  }

  useEffect(() => {
    console.log('useEffect focus - isOpen:', isOpen, 'mode:', mode)
    if (isOpen && mode === 'search') {
      setTimeout(() => {
        console.log('Focusing input')
        inputRef.current?.focus()
      }, 0)
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (mode === 'map' && mapContainerRef.current && !mapRef.current) {
      mapboxgl.accessToken = accessToken
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: mapPin || [-71.5430, -35.4272],
        zoom: 11,
        interactive: true,
      })

      map.on('click', async (e) => {
        const { lng, lat } = e.lngLat
        setMapPin([lng, lat])
        const geocodeResult = await reverseGeocode(lng, lat, accessToken)

        const newLocation: Location = {
          id: `location-${Date.now()}`,
          coords: [lng, lat],
          address: geocodeResult?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          region: geocodeResult?.cityRegion,
          country: 'Chile',
          source: 'manual',
        }
        const newLocations = [...value, newLocation]
        onChange(newLocations)
      })

      mapRef.current = map
      return () => {
        map.remove()
        mapRef.current = null
      }
    }
  }, [mode, mapPin, accessToken, value])

  const handleSelectResult = async (result: SearchResult & { isCurrent?: boolean }) => {
    const isRegion = result.locationType === 'region'

    if (result.isCurrent) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          const geocodeResult = await reverseGeocode(lng, lat, accessToken)

          const newLocation: Location = {
            id: `location-${Date.now()}`,
            coords: [lng, lat],
            address: geocodeResult?.address || 'Current location',
            region: geocodeResult?.cityRegion,
            country: 'Chile',
            source: 'search',
          }
          const newLocations = [...value, newLocation]
          onChange(newLocations)
          setInputValue('')
        })
      }
      return
    }

    if (isRegion) {
      const newSelected = new Set(selectedRegions)
      if (newSelected.has(result.id)) {
        newSelected.delete(result.id)
      } else {
        newSelected.add(result.id)
      }
      setSelectedRegions(newSelected)
      return
    }

    if (!result.center) {
      const geocodeQuery = encodeURIComponent(result.place_name)
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${geocodeQuery}.json?access_token=${accessToken}&country=CL&limit=1`
        )
        const data = await response.json()
        if (data.features?.[0]) {
          const feature = data.features[0]
          const [lng, lat] = feature.center
          const geocodeResult = await reverseGeocode(lng, lat, accessToken)

          const newLocation: Location = {
            id: `location-${Date.now()}-${result.id}`,
            coords: [lng, lat],
            address: feature.place_name,
            region: geocodeResult?.cityRegion,
            country: 'Chile',
            source: 'search',
          }
          const newLocations = [...value, newLocation]
          onChange(newLocations)
          setInputValue('')
        }
      } catch (err) {}
      return
    }

    const [lng, lat] = result.center
    const geocodeResult = await reverseGeocode(lng, lat, accessToken)

    const newLocation: Location = {
      id: `location-${Date.now()}-${result.id}`,
      coords: [lng, lat],
      address: result.place_name || result.text,
      region: geocodeResult?.cityRegion,
      country: 'Chile',
      source: 'search',
    }

    const newLocations = [...value, newLocation]
    onChange(newLocations)
    setInputValue('')
  }

  const handleConfirmMap = () => {
    if (mapPin) {
      setMode('search')
      setIsOpen(false)
    }
  }

  const handleClearLocation = (id: string) => {
    onChange(value.filter((loc) => loc.id !== id))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const resultToLayer = (result: SearchResult & { isCurrent?: boolean }): Layer => {
    const isRegion = result.locationType === 'region'

    return {
      id: String(result.id),
      label: result.place_name,
      type: 'data',
      geometry: isRegion ? 'polygon' : 'point',
      color: COLORS.searchElements,
      visible: true,
      opacity: 100,
      source: 'search',
    }
  }

  const displayResults = inputValue.trim() ? searchResults : DEFAULT_SUGGESTIONS
  const visibleCount = 3
  const showMoreCount = value.length > visibleCount ? value.length - visibleCount : 0

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="flex items-center gap-1 flex-wrap">
        {value.slice(0, visibleCount).map((loc) => (
          <button
            key={loc.id}
            onClick={() => setIsOpen(true)}
            className={cn(
              'flex items-center gap-1 px-2 h-[30px] rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-accent'
            )}
          >
            <MapPin className="flex-shrink-0 size-4" />
            <span className="truncate max-w-[120px]">{loc.address}</span>
          </button>
        ))}
        {showMoreCount > 0 && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center justify-center h-[30px] w-[30px] rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-accent">
                +{showMoreCount}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 border-border-weak" style={{ width: `${panelWidth}px` }}>
              <div className="flex flex-col">
                <div className="border-b border-border-weak p-3">
                  <div className="text-sm font-medium text-text-strong mb-2">Ubicaciones seleccionadas</div>
                  <div className="space-y-1">
                    {value.map((loc) => (
                      <div key={loc.id} className="flex items-center justify-between gap-2 text-sm py-1">
                        <span className="truncate text-text">{loc.address}</span>
                        <button
                          onClick={() => handleClearLocation(loc.id)}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {value.length === 0 && (
            <button
              className={cn(
                'flex items-center gap-1 px-2 h-[30px] rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-muted-foreground'
              )}
            >
              <MapPin className="flex-shrink-0 size-4" />
              <span>Ubicación</span>
            </button>
          )}
        </PopoverTrigger>

        <PopoverContent align="start" className="p-0 border-border-weak" style={{ width: `${panelWidth}px` }}>
          {mode === 'search' ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1 border-b border-border-weak p-2">
                <SearchIcon className="text-muted-foreground flex-shrink-0 size-4 ml-1" />
                <input
                  ref={inputRef}
                  type="text"
                  className={cn(
                    'flex-1 h-[30px] px-1 focus:outline-none bg-transparent text-sm',
                    'text-foreground placeholder-muted-foreground'
                  )}
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => {
                    console.log('Input onChange:', e.target.value)
                    handleInputChange(e.target.value)
                  }}
                  disabled={isLoading}
                  onFocus={() => {
                    console.log('Input onFocus')
                    if (inputValue.length >= 3) setIsOpen(true)
                  }}
                  onBlur={() => {
                    console.log('Input onBlur')
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                />
                <button
                  onClick={() => {
                    console.log('Clear button clicked')
                    handleInputChange('')
                    inputRef.current?.focus()
                  }}
                  disabled={isLoading || !inputValue}
                  className={cn(
                    'h-6 w-6 rounded-full text-muted-foreground hover:text-foreground flex-shrink-0 transition-opacity',
                    !inputValue ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  )}
                >
                  <X className="size-3" />
                </button>
              </div>

              <ScrollArea className="max-h-60">
                {displayResults.length === 0 ? (
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    {isLoading ? 'Buscando...' : 'Sin resultados'}
                  </div>
                ) : (
                  <div className="space-y-1 p-1">
                    {displayResults.map((result) => (
                      <div key={result.id} className="relative">
                        <LayerItem
                          layer={resultToLayer(result)}
                          isSearchResult={true}
                          isSelected={selectedRegions.has(result.id)}
                          onClick={() => handleSelectResult(result)}
                          onToggleVisibility={(e) => e.stopPropagation()}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="border-t border-border-weak p-1">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMode('map')
                  }}
                  className="h-8 w-full px-1.5 py-2 text-sm rounded-sm hover:bg-muted transition-colors flex items-center gap-2 text-accent font-medium"
                >
                  <MapPin className="size-4" />
                  Seleccionar en mapa
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div
                ref={mapContainerRef}
                className="relative w-full h-64 bg-background-weak border-b border-border-weak"
              />

              <div className="flex gap-1 p-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setMode('search')
                    if (mapRef.current) {
                      mapRef.current.remove()
                      mapRef.current = null
                    }
                  }}
                >
                  Volver
                </Button>
                <Button
                  className="flex-1"
                  disabled={!mapPin}
                  onClick={handleConfirmMap}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearAll}
          className="h-[30px] w-[30px] rounded-full text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
