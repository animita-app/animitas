"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Location {
  address: string
  cityRegion: string
  lat: number
  lng: number
}

interface LocationPickerProps {
  value: Location | null
  onChange: (location: Location | null) => void
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchMode, setSearchMode] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false)

  // Automatically request location on mount
  React.useEffect(() => {
    if (!value && navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Ubicación actual",
            cityRegion: "Detectada automáticamente"
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoadingLocation(false)
        }
      )
    }
  }, []) // Only run on mount

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Ubicación actual",
            cityRegion: "Detectada automáticamente"
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoadingLocation(false)
        }
      )
    }
  }

  if (!value && !searchMode) {
    return (
      <div className="flex gap-2">
        <Input
          placeholder={isLoadingLocation ? "Detectando ubicación..." : "Buscar dirección..."}
          className="flex-1 h-10 border-border-weak rounded-md"
          onFocus={() => setSearchMode(true)}
          disabled={isLoadingLocation}
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 border-border-weak"
          onClick={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? "Detectando..." : "Usar ubicación actual"}
        </Button>
      </div>
    )
  }

  if (searchMode) {
    return (
      <div className="space-y-2">
        <Input
          autoFocus
          placeholder="Buscar dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 border-border-weak rounded-md"
        />
        <div className="text-xs text-text-weak">
          <button
            type="button"
            className="font-bold hover:underline"
            onClick={handleUseCurrentLocation}
          >
            O usar ubicación actual
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 border border-border-weak rounded-md bg-white">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{value?.address}</p>
        {value?.cityRegion && (
          <p className="text-xs text-text-weak truncate">{value?.cityRegion}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(null)}
        className="text-xs font-bold text-[#FF5A5F] hover:underline"
      >
        Cambiar
      </button>
    </div>
  )
}
