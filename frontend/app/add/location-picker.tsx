"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import { MapPin, Search, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { reverseGeocode, searchLocation } from "@/lib/mapbox"
import { fetchPlaceBoundary } from "@/lib/boundary-service"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Feature, Geometry } from "geojson"
import * as turf from "@turf/turf"

type LocationValue = { lat: number; lng: number; address: string; cityRegion: string }
type AreaSelection = { geometry: Geometry; name: string; type: string; id: string }
type Selection = LocationValue | AreaSelection

interface LocationPickerProps {
  value: LocationValue | null
  onChange: (location: LocationValue) => void
  mode?: 'point' | 'area' | 'both'
}

function truncateAddress(address: string): string {
  const parts = address.split(',')
  if (parts.length > 2) {
    return `${parts[0]}, ${parts[1]}`
  }
  return address
}

export function LocationPicker({ value, onChange, mode = 'both' }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const currentLocationMarker = useRef<mapboxgl.Marker | null>(null)
  const areaLayerId = useRef<string>('location-area-layer')
  const areaSourceId = useRef<string>('location-area-source')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const [open, setOpen] = useState(false)

  const [pendingLocation, setPendingLocation] = useState<LocationValue | null>(value)
  const [selectedAreas, setSelectedAreas] = useState<AreaSelection[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

  useEffect(() => {}, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {}
      )
    }
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    if (!accessToken) {
      return
    }

    const initializeMap = () => {
      if (!mapContainer.current) {
        setTimeout(initializeMap, 50)
        return
      }

      if (!map.current) {
        const center: [number, number] = value
          ? [value.lng, value.lat]
          : [-71.0, -33.4]

        try {
          mapboxgl.accessToken = accessToken
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/satellite-v9",
            center,
            zoom: 15,
            dragRotate: false,
          })

          map.current.on('style.load', () => {
            if (!map.current) return
            map.current.addSource(areaSourceId.current, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
            map.current.addLayer({
              id: areaLayerId.current,
              type: 'fill',
              source: areaSourceId.current,
              paint: { 'fill-color': '#0066ee', 'fill-opacity': 0.3 }
            })
          })
        } catch (err) {
          return
        }

        const handleMapMoveEnd = async () => {
          if (!map.current || selectedAreas.length > 0) return

          setIsLoadingGeo(true)
          const { lng, lat } = map.current.getCenter()
          const result = await reverseGeocode(lng, lat, accessToken)

          if (result) {
            setPendingLocation({
              lng,
              lat,
              address: result.address,
              cityRegion: result.cityRegion,
            })
          }
          setIsLoadingGeo(false)
        }

        const debouncedMoveEnd = (() => {
          let timeout: NodeJS.Timeout
          return () => {
            clearTimeout(timeout)
            timeout = setTimeout(handleMapMoveEnd, 300)
          }
        })()

        map.current.on('moveend', debouncedMoveEnd)
        handleMapMoveEnd()

        if (currentLocation && !currentLocationMarker.current) {
          const pinEl = document.createElement('div')
          pinEl.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
          pinEl.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 80 80" style="position: absolute; left: -40px; top: -40px;">
              <defs>
                <radialGradient id="haloGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style="stop-color:#00e;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#00e;stop-opacity:0" />
                </radialGradient>
              </defs>
              <circle cx="40" cy="40" r="32" fill="url(#haloGradient)" />
              <path d="M 40 40 L 40 8 A 32 32 0 0 1 59 20 Z" fill="#00e" opacity="0.4" />
              <circle cx="40" cy="40" r="14" fill="white" />
              <circle cx="40" cy="40" r="9" fill="#00e" />
            </svg>
          `
          currentLocationMarker.current = new mapboxgl.Marker({ element: pinEl })
            .setLngLat([currentLocation.lng, currentLocation.lat])
            .addTo(map.current)
        }

        return () => {
          if (map.current) {
            map.current.off('moveend', debouncedMoveEnd)
          }
        }
      } else if (value && map.current) {
        map.current.flyTo({
          center: [value.lng, value.lat],
          zoom: 15,
        })
        setPendingLocation(value)
      }
    }

    initializeMap()
  }, [open, value, accessToken, currentLocation, selectedAreas.length])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    clearTimeout(searchTimeoutRef.current)

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchLocation(query, accessToken)
      const seen = new Set<string>()
      const filtered = results
        .filter((r: any) => {
          if (r.place_type?.includes('country')) return false
          const placeName = r.place_name?.split(',')[0]?.trim() || ''
          if (seen.has(placeName)) return false
          seen.add(placeName)
          return true
        })
        .slice(0, 8)
      setSearchResults(filtered)
      setIsSearching(false)
    }, 400)
  }

  const handleSearchResultClick = async (feature: any) => {
    if (!map.current) return

    const [lng, lat] = feature.geometry.coordinates
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
    })

    const isBoundary = feature.place_type?.some((t: string) =>
      ['region', 'district', 'place', 'locality'].includes(t)
    ) || feature.bbox

    if (isBoundary) {
      setIsSearching(true)
      const boundary = await fetchPlaceBoundary(feature.place_name || feature.text)
      if (boundary && map.current) {
        const placeName = feature.place_name || feature.text
        setSelectedAreas(prev => {
          const exists = prev.find(a => a.name === placeName)
          if (exists) {
            return prev.filter(a => a.name !== placeName)
          }
          return [...prev, {
            geometry: boundary.geometry,
            name: placeName,
            type: feature.place_type?.[0] || 'area',
            id: `${placeName}-${Date.now()}`
          }]
        })

        if (currentLocationMarker.current) {
          currentLocationMarker.current.remove()
        }
      }
      setIsSearching(false)
    }

    setSearchQuery("")
    setSearchResults([])
  }

  useEffect(() => {
    if (!map.current || selectedAreas.length === 0) return

    const source = map.current.getSource(areaSourceId.current) as any
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: selectedAreas.map(area => ({
          type: 'Feature' as const,
          geometry: area.geometry,
          properties: {}
        }))
      })
    }

    setTimeout(() => {
      if (!map.current) return
      try {
        const bounds = new mapboxgl.LngLatBounds()
        selectedAreas.forEach(area => {
          if (area.geometry.type === 'Polygon') {
            const coords = area.geometry.coordinates[0]
            coords.forEach((coord: any) => { bounds.extend(coord as [number, number]) })
          } else if (area.geometry.type === 'MultiPolygon') {
            area.geometry.coordinates.forEach((polygon: any) => {
              polygon[0].forEach((coord: any) => { bounds.extend(coord as [number, number]) })
            })
          }
        })
        map.current.fitBounds(bounds, { padding: 20, duration: 600, maxZoom: 13 })
      } catch (err) {
        // silent
      }
    }, 100)
  }, [selectedAreas])

  const handleConfirm = () => {
    if (selectedAreas.length > 0) {
      const allBounds = new mapboxgl.LngLatBounds()
      selectedAreas.forEach(area => {
        if (area.geometry.type === 'Polygon') {
          const coords = area.geometry.coordinates[0]
          coords.forEach((coord: any) => { allBounds.extend(coord as [number, number]) })
        } else if (area.geometry.type === 'MultiPolygon') {
          area.geometry.coordinates.forEach((polygon: any) => {
            polygon[0].forEach((coord: any) => { allBounds.extend(coord as [number, number]) })
          })
        }
      })
      const center = allBounds.getCenter()
      onChange({
        lng: center.lng,
        lat: center.lat,
        address: selectedAreas.map(a => a.name).join(', '),
        cityRegion: selectedAreas.map(a => a.type).join(', ')
      })
      setOpen(false)
    } else if (pendingLocation && 'lat' in pendingLocation && 'lng' in pendingLocation) {
      onChange(pendingLocation)
      setOpen(false)
    }
  }

  const displayText = selectedAreas.length > 0
    ? selectedAreas.map(a => a.name).join(', ')
    : (value ? truncateAddress(value.address) : "Seleccionar ubicación")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge className="bg-accent/7 text-accent rounded-full max-w-xs">
          {displayText ? (
            <span className="text-xs truncate">{displayText}</span>
          ) : (
            <div className="text-accent text-xs flex items-center gap-1">
              <MapPin size={16} />
              <span className="text-sm">Seleccionar ubicación</span>
            </div>
          )}
        </Badge>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0 gap-0 flex overflow-hidden flex-col max-h-[600px]" align="start">
        <div className="relative h-48 overflow-hidden border-b border-border-weak bg-muted shrink-0">
          <div ref={mapContainer} className="[&_.mapboxgl-control-container]:hidden absolute inset-0" />

          {mode !== 'area' && selectedAreas.length === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-black" />
              </div>
              <div className="w-0.5 h-4 rounded-full bg-white" />
            </div>
          )}

          {isLoadingGeo && (
            <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-text-weak">
              Detectando...
            </div>
          )}

          {(pendingLocation || selectedAreas.length > 0) && (
            <div className="w-fit flex flex-col items-center justify-center absolute bottom-2 left-1/2 -translate-x-1/2">
              <Button
                onClick={handleConfirm}
                size="sm"
                className="text-xs flex flex-col !h-fit py-1.5 gap-0 items-center justify-center max-w-xs"
              >
                Confirmar
                <p className="max-w-64 font-medium text-white opacity-75 truncate">{selectedAreas.length > 0 ? selectedAreas.map(a => a.name).join(', ') : (pendingLocation ? truncateAddress(pendingLocation.address) : '')}</p>
              </Button>
            </div>
          )}
        </div>

        <div className="p-0 space-y-0 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-text-weak pointer-events-none" />
            <Input
              placeholder="Buscar ubicación o región..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 rounded-none border-0 bg-transparent focus:ring-0 shadow-none focus:border-0 focus-visible:ring-0 border-b focus:border-b focus:!border-b-border focus-visible:!border-b-border focus:ring-offset-0 focus:shadow-none"
            />
            {isSearching && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 size-4 animate-spin text-text-weak" />}
          </div>

          <ScrollArea className="max-h-96 p-1 space-y-1">
            {selectedAreas.length > 0 && (
              <div className="flex flex-col gap-1">
                {selectedAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedAreas(prev => prev.filter(a => a.id !== area.id))}
                    className="w-full text-left px-2 py-2 text-sm bg-accent/7 hover:bg-accent/10 text-accent rounded-sm flex items-center justify-between gap-2"
                    title={area.name}
                  >
                    <span className="truncate max-w-60">{area.name}</span>
                    <X size={16} className="text-accent/30 shrink-0 -mr-1" />
                  </button>
                ))}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="p-1 space-y-1">
                {searchResults
                  .filter((result) => !selectedAreas.some(a => a.name === result.place_name))
                  .map((result, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-2 py-2 text-sm rounded-sm hover:bg-muted flex items-center justify-between gap-2"
                      title={result.place_name}
                    >
                      <span className="truncate max-w-60">{result.place_name}</span>
                    </button>
                  ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
