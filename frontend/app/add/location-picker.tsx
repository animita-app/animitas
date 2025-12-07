"use client"

import * as React from "react"
import mapboxgl from "mapbox-gl"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { MapPin, Locate, Check, ChevronsUpDown, MousePointer2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMapInitialization } from "@/components/map/hooks/useMapInitialization"

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
  const [open, setOpen] = React.useState(false)
  const [triggerWidth, setTriggerWidth] = React.useState(0)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])



  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "!px-3 w-full justify-between font-normal active:scale-100 bg-muted border-border-weak",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-3 text-left w-full overflow-hidden">
              {value ? (
                <div className="flex-1 min-w-0">
                  <p className="font-normal text-foreground truncate">{value.address}</p>
                  <p className="sr-only text-xs text-muted-foreground truncate">{value.cityRegion}</p>
                </div>
              ) : (
                <span className="flex-1 truncate">Agregar ubicación</span>
              )}
            </div>
            {value ? (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="ml-2 hover:bg-muted-foreground/20 rounded-sm p-0.5 transition-colors"
              >
                <X className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent style={{ width: triggerWidth }} className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Busca una dirección..." />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange({
                      address: "UAI",
                      cityRegion: "Santiago, RM",
                      lat: -33.45,
                      lng: -70.66
                    })
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-3 h-full max-h-9">
                    <MousePointer2 className="size-4 rotate-90 stroke-[0.5px] fill-accent" />
                    <span className="text-sm font-normal">Usar ubicación actual</span>
                  </div>
                </CommandItem>

                {/* Mock Results */}
                {[1, 2].map((i) => (
                  <CommandItem
                    key={i}
                    value={`Av. Providencia 123${i}`}
                    onSelect={() => {
                      onChange({
                        address: `Av. Providencia 123${i}`,
                        cityRegion: "Providencia, Región Metropolitana",
                        lat: -33.42,
                        lng: -70.61
                      })
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-3 w-full h-full max-h-9">
                      <MapPin className="size-4" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-normal truncate">Av. Providencia 123{i}</span>
                        <span className="sr-only text-xs text-muted-foreground truncate">Providencia, Región Metropolitana</span>
                      </div>
                      {value?.address === `Av. Providencia 123${i}` && (
                        <Check className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Map Preview Fragment */}
      {value && (
        <LocationMapPreview
          lat={value.lat}
          lng={value.lng}
        />
      )}
    </div>
  )
}

function LocationMapPreview({ lat, lng }: { lat: number; lng: number }) {
  const { mapContainer, map, isMapReady } = useMapInitialization({
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
    style: "mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7"
  })

  React.useEffect(() => {
    if (!map.current || !isMapReady) return

    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true
    })
  }, [lat, lng, isMapReady, map])

  return (
    <div className="w-full h-24 rounded-md border bg-muted border-border-weak relative overflow-hidden flex items-center justify-center">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="z-10 text-accent mb-2">
        <MapPin className="size-6" />
      </div>
    </div>
  )
}
