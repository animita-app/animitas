"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { LocateFixed } from "lucide-react"
import Image from "next/image"
import { Spinner } from "@/components/ui/spinner"
import { reverseGeocode } from "@/lib/mapbox"
import { shortAddress } from "@/lib/location"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { applyPaperStyle } from "@/components/map/paper-style"

export interface PickedLocation {
  lat: number
  lng: number
  address?: string
  cityRegion?: string
}

interface LocationPickerProps {
  value: PickedLocation | null
  onChange: (location: PickedLocation) => void
  invalid?: boolean
  describedBy?: string
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""
const CHILE_CENTER: [number, number] = [-70.65, -33.45]

type GpsState = "idle" | "locating" | "denied"

export function LocationPicker({ value, onChange, invalid, describedBy }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const geocodeRequest = useRef(0)
  const onChangeRef = useRef(onChange)
  const [gps, setGps] = useState<GpsState>("idle")

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const pick = useCallback(async (lng: number, lat: number) => {
    onChangeRef.current({ lat, lng })
    const request = ++geocodeRequest.current
    const place = await reverseGeocode(lng, lat, TOKEN)
    if (place && request === geocodeRequest.current) {
      onChangeRef.current({ lat, lng, address: place.address || undefined, cityRegion: place.cityRegion || undefined })
    }
  }, [])

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGps("denied")
      return
    }
    setGps("locating")
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGps("idle")
        mapRef.current?.jumpTo({ center: [coords.longitude, coords.latitude], zoom: 17 })
        pick(coords.longitude, coords.latitude)
      },
      () => setGps("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [pick])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      accessToken: TOKEN,
      style: "mapbox://styles/icarusmind/cmg8sxgbf002y01qwfic65ao7",
      center: CHILE_CENTER,
      zoom: 10,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      // The page scrolls past this map, so the wheel scrolls the page; zoom is pinch or double click.
      scrollZoom: false,
    })
    map.touchZoomRotate.disableRotation()
    map.on("load", () => applyPaperStyle(map))
    map.on("moveend", (e) => {
      if (!(e as any).originalEvent) return
      const { lng, lat } = map.getCenter()
      pick(lng, lat)
    })
    mapRef.current = map
    locate()

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [locate, pick])

  return (
    <div className="space-y-2">
      <div
        data-vaul-no-drag
        className={cn(
          "print-frame h-64 p-1.5 touch-none md:h-80",
          invalid && "ring-[3px] ring-destructive/30"
        )}
      >
        {/* Mapbox makes its container position: relative, so the map fills a wrapper instead of being inset. */}
        <div className="relative size-full overflow-hidden">
          <div
            ref={containerRef}
            className="size-full"
            role="application"
            aria-label="Mapa para ubicar la animita. Muévelo hasta dejar el pin sobre ella."
            aria-describedby={describedBy}
          />
          {/* The real pin from the shelf; its point, at the bottom left of the photo, marks the spot. */}
          <Image src="/cutouts/pin-red.png" alt="" width={160} height={300} draggable={false} className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-auto -translate-x-1 -translate-y-full drop-shadow-[0_4px_3px_rgb(28_24_20_/_0.4)]" />
          <Button
            type="button"
            variant="sign-service"
            size="sm"
            onClick={locate}
            disabled={gps === "locating"}
            className="absolute bottom-2 right-2"
          >
            {gps === "locating" ? <Spinner /> : <LocateFixed aria-hidden />}
            {gps === "locating" ? "Ubicando…" : "Mi ubicación"}
          </Button>
        </div>
      </div>
      <p className="text-sm text-text-weak text-pretty" aria-live="polite">
        {gps === "denied" && !value
          ? "No pudimos ver tu ubicación. Mueve el mapa hasta dejar el pin sobre la animita."
          : value?.address
            ? shortAddress(value.address)
            : "Mueve el mapa hasta dejar el pin sobre la animita."}
      </p>
    </div>
  )
}
