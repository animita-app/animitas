'use client'

import { useRef, useEffect, useState } from 'react'
import { MapPin, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Combobox, ComboboxInput, ComboboxContent, ComboboxTrigger } from '@/components/ui/combobox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { reverseGeocode } from '@/lib/mapbox'

export interface Location {
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
}

interface LocationSelectorProps {
  value: Location | null
  onChange: (location: Location | null) => void
  onSearch?: (query: string) => void
  searchResults?: SearchResult[]
  isLoading?: boolean
  panelWidth?: number
  placeholder?: string
}

type Mode = 'search' | 'map'

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
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

  const [mode, setMode] = useState<Mode>('search')
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [mapPin, setMapPin] = useState<[number, number] | null>(value?.coords || null)

  console.log('LocationSelector render - mode:', mode, 'isOpen:', isOpen)

  useEffect(() => {
    if (isOpen && mode === 'search') {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen, mode])

  const handleSelectResult = async (result: SearchResult) => {
    if (!result.center) return

    const [lng, lat] = result.center
    const geocodeResult = await reverseGeocode(lng, lat, accessToken)

    const newLocation: Location = {
      coords: [lng, lat],
      address: result.place_name || result.text,
      region: geocodeResult?.cityRegion,
      country: 'Chile',
      source: 'search',
    }

    onChange(newLocation)
    setIsOpen(false)
    setInputValue('')
  }

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return

    const rect = mapContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const lng = -70.67 + (x / rect.width) * 10
    const lat = -23 + (y / rect.height) * 10

    const geocodeResult = await reverseGeocode(lng, lat, accessToken)
    setMapPin([lng, lat])

    const newLocation: Location = {
      coords: [lng, lat],
      address: geocodeResult?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      region: geocodeResult?.cityRegion,
      country: 'Chile',
      source: 'manual',
    }

    onChange(newLocation)
  }

  const handleConfirmMap = () => {
    if (mapPin) {
      setMode('search')
      setIsOpen(false)
    }
  }

  const handleClearLocation = () => {
    onChange(null)
    setMapPin(null)
    setInputValue('')
  }

  const formatPlaceName = (place: string) => {
    return place
      .replace(/,\s*\d{7}(?:,|$)/g, ',')
      .replace(/,\s*\d{5}(?:,|$)/g, ',')
      .replace(/,\s*\d{4}(?:,|$)/g, ',')
      .replace(/,\s+,/g, ',')
      .replace(/,\s*$/, '')
      .trim()
  }

  return (
    <Combobox open={isOpen} onOpenChange={setIsOpen}>
      <ComboboxTrigger
        className={cn(
          'font-medium flex items-center gap-1 px-3 h-[26px] rounded-full bg-secondary hover:bg-secondary/80 transition-colors',
          value ? 'text-accent' : 'text-text'
        )}
      >
        <MapPin className="flex-shrink-0 w-3 h-3" />
        <span className="text-sm">
          {value ? value.address : 'Seleccionar ubicación'}
        </span>
        {value && (
          <X
            className="w-3 h-3 ml-auto flex-shrink-0 hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              handleClearLocation()
            }}
          />
        )}
      </ComboboxTrigger>

      <ComboboxContent className="p-0" style={{ width: `${panelWidth}px` }}>
        {mode === 'search' ? (
          <div className="flex flex-col">
            <ComboboxInput
              ref={inputRef}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                onSearch?.(e.target.value)
              }}
              disabled={isLoading}
              className="border-b border-border-weak"
            />

            <ScrollArea className="max-h-60">
              {searchResults.length === 0 ? (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  {isLoading ? 'Buscando...' : inputValue ? 'Sin resultados' : 'Escribe para buscar'}
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent/10 transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title || result.text}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {formatPlaceName(result.place_name)}
                        </div>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-border-weak mt-1 pt-1">
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        console.log('🗺️ Map button pointer down!')
                        e.preventDefault()
                        e.stopPropagation()
                        setMode('map')
                      }}
                      className="w-full px-3 py-2 text-sm rounded-sm hover:bg-accent/10 transition-colors flex items-center gap-2 text-accent font-medium"
                    >
                      <MapPin className="w-4 h-4" />
                      Seleccionar en mapa
                    </button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col">
            <div
              ref={mapContainerRef}
              onClick={handleMapClick}
              className="relative w-full h-64 bg-background-weak border-b border-border-weak cursor-crosshair flex items-center justify-center"
            >
              <div className="text-center text-sm text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Haz clic para seleccionar ubicación
              </div>

              {mapPin && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all"
                  style={{
                    left: `${((mapPin[0] + 70.67) / 10) * 100}%`,
                    top: `${((mapPin[1] + 23) / 10) * 100}%`,
                  }}
                >
                  <MapPin className="w-6 h-6 text-accent fill-accent drop-shadow-lg" />
                </div>
              )}
            </div>

            <div className="flex gap-2 p-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  console.log('Back button clicked')
                  setMode('search')
                }}
              >
                Volver
              </Button>
              <Button
                className="flex-1"
                disabled={!mapPin}
                onClick={handleConfirmMap}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
