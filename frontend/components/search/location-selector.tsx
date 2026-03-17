'use client'

import { useRef, useEffect, useState } from 'react'
import { MapPin, X, Check, Search as SearchIcon, Plus, MousePointer2 } from 'lucide-react'
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
  const [isOpenSearch, setIsOpenSearch] = useState(false)
  const [isOpenMore, setIsOpenMore] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [mapPin, setMapPin] = useState<[number, number] | null>(value[0]?.coords || null)
  const [mapAddress, setMapAddress] = useState<string>('')
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const handleInputChange = (val: string) => {
    setInputValue(val)
    onSearch?.(val)
  }

  useEffect(() => {
    if (isOpenSearch && mode === 'search') {
      inputRef.current?.focus()
    }
  }, [isOpenSearch, mode, searchResults])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (mode === 'map' && mapContainerRef.current && !mapRef.current) {
      try {
        if (!accessToken) {
          console.error('Mapbox access token is missing')
          return
        }

        mapboxgl.accessToken = accessToken
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: mapPin || [-71.5430, -35.4272],
          zoom: 11,
          interactive: true,
        })

        map.on('error', (e) => {
          console.error('Mapbox error event:', e.error)
        })

        map.on('load', () => {
          const center = map.getCenter()
          const centerCoords: [number, number] = [center.lng, center.lat]
          setMapPin(centerCoords)

          const marker = new mapboxgl.Marker({ color: '#0000ee' })
            .setLngLat(centerCoords)
            .addTo(map)
          markerRef.current = marker

          reverseGeocode(centerCoords[0], centerCoords[1], accessToken).then((result) => {
            if (result?.address) {
              setMapAddress(result.address)
            }
          })
        })

        map.on('moveend', async () => {
          const center = map.getCenter()
          const centerCoords: [number, number] = [center.lng, center.lat]
          setMapPin(centerCoords)

          if (markerRef.current) {
            markerRef.current.setLngLat(centerCoords)
          }

          const geocodeResult = await reverseGeocode(centerCoords[0], centerCoords[1], accessToken)
          if (geocodeResult?.address) {
            setMapAddress(geocodeResult.address)
          }
        })

        mapRef.current = map
        return () => {
          if (mapRef.current) {
            mapRef.current.remove()
            mapRef.current = null
          }
        }
      } catch (error) {
        console.error('Failed to initialize Mapbox:', error)
      }
    }
  }, [mode, accessToken])

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
      const center: [number, number] = result.center || [-71.5430, -35.4272]
      const newLocation: Location = {
        id: `location-${Date.now()}-${result.id}`,
        coords: center,
        address: result.place_name,
        region: result.place_name,
        country: 'Chile',
        source: 'search',
      }
      const newLocations = [...value, newLocation]
      onChange(newLocations)
      setInputValue('')
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
      const newLocation: Location = {
        id: `location-${Date.now()}`,
        coords: mapPin,
        address: mapAddress || `${mapPin[1].toFixed(4)}, ${mapPin[0].toFixed(4)}`,
        country: 'Chile',
        source: 'manual',
      }
      const newLocations = [...value, newLocation]
      onChange(newLocations)
      setMapAddress('')
      setMode('search')
      setIsOpenSearch(false)
    }
  }

  const handleClearLocation = (id: string) => {
    onChange(value.filter((loc) => loc.id !== id))
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
          <div
            key={loc.id}
            className={cn(
              'flex items-center gap-1 px-2 h-[30px] rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-accent group'
            )}
          >
            <MapPin className="flex-shrink-0 size-4" />
            <span className="truncate max-w-[120px]">{loc.address}</span>
            <button
              onClick={() => handleClearLocation(loc.id)}
              className="cursor-pointer ml-1 flex-shrink-0 hover:opacity-100"
            >
              <X className="size-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ))}
        {showMoreCount > 0 && (
          <Popover open={isOpenMore} onOpenChange={setIsOpenMore}>
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
                          className="flex-shrink-0"
                        >
                          <X className="size-4 opacity-50" />
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

      <Popover open={isOpenSearch} onOpenChange={setIsOpenSearch}>
        <PopoverTrigger asChild>
          {value.length === 0 ? (
            <button
              className={cn(
                'flex items-center gap-1 px-2 h-[30px] rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-muted-foreground'
              )}
            >
              <MapPin className="flex-shrink-0 size-4" />
              <span className="truncate max-w-[150px]">{mode === 'map' && mapAddress ? mapAddress : 'Ubicación'}</span>
            </button>
          ) : (
            <button
              className={cn(
                'flex [&_svg]:size-4 [&_svg]:opacity-50 items-center aspect-square gap-1 px-2 h-[30px] rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium'
              )}
            >
              <Plus />
            </button>
          )}
        </PopoverTrigger>

        <PopoverContent align="start" side="top" className="p-0 border-border-weak" style={{ width: `${panelWidth}px` }}>
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
                    handleInputChange(e.target.value)
                  }}
                  disabled={isLoading}
                  onFocus={() => {
                    if (inputValue.length >= 3) setIsOpenSearch(true)
                  }}
                  onBlur={() => {
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                />
                <button
                  onPointerDown={(e) => {
                    e.preventDefault()
                    handleInputChange('')
                    inputRef.current?.focus()
                  }}
                  disabled={isLoading || !inputValue}
                  className="h-6 w-6 rounded-full flex-shrink-0"
                >
                  <X className="opacity-50 size-4" />
                </button>
              </div>

              <ScrollArea className="max-h-60" onPointerDown={(e) => e.preventDefault()}>
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
                  onClick={(e) => {
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
            <div className="flex flex-col w-full h-64 relative">
              <div
                ref={mapContainerRef}
                className="absolute inset-0 overflow-hidden"
              />

              {mapAddress && (
                <div className="absolute top-2 left-2 right-12 z-20 bg-background/90 border border-border-weak rounded-md p-2 text-xs font-medium text-text-strong truncate">
                  {mapAddress}
                </div>
              )}

              <Button
                size="icon"
                variant="secondary"
                className="!bg-accent hover:!bg-accent absolute bottom-16 right-2 z-20 shadow-xs"
                onClick={() => {
                  if (navigator.geolocation && mapRef.current) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      const { latitude, longitude } = pos.coords
                      setMapPin([longitude, latitude])
                      mapRef.current?.flyTo({
                        center: [longitude, latitude],
                        zoom: 15,
                        duration: 1000,
                      })
                    })
                  }
                }}
                title="Mi ubicación"
              >
                <MousePointer2 className="size-4 rotate-90 stroke-0 fill-white" />
              </Button>

              <div className="flex gap-1 p-2 relative z-10 mt-auto">
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

    </div>
  )
}
