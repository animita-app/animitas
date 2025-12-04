import React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AnimitaProperty } from '../paywall/types'
import Link from 'next/link'
import { Popover, PopoverContent, PopoverTrigger, PopoverArrow } from '@/components/ui/popover'
import { Site } from '@/types/mock'
import { ArrowUpRight } from 'lucide-react'
import { COLORS, ICONS } from '@/lib/map-style'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { Label } from '../ui/label'

interface MarkerIconProps {
  site?: Site
  // Legacy props for backward compatibility during refactor, but we should prefer site
  id?: string
  name?: string
  images?: string[]
  typology?: string
  death_cause?: string

  className?: string
  activeProperties?: AnimitaProperty[]
  highlight?: boolean
  halo?: boolean
  pulse?: boolean
  zoomedIn?: boolean
}

export const MarkerIcon = ({
  site,
  id: propId,
  name: propName,
  images: propImages,
  typology: propTypology,
  death_cause: propDeathCause,
  className,
  activeProperties = ['typology', 'death_cause'],
  highlight = false,
  halo = false,
  pulse = false,
  zoomedIn = false
}: MarkerIconProps) => {

  // Extract values from site object or fallback to props
  const id = site?.id || propId
  const name = site?.title || propName
  const images = site?.images || propImages || []
  const typology = site?.typology || propTypology
  const death_cause = site?.insights?.memorial?.death_cause || propDeathCause

  // Helper to get typology data safely
  const getTypologyData = (type?: string) => {
    return ICONS.typology[type as keyof typeof ICONS.typology] || ICONS.typology.default
  }

  // Helper to get death cause data safely
  const getDeathCauseData = (cause?: string) => {
    return ICONS.deathCause[cause as keyof typeof ICONS.deathCause] || ICONS.deathCause.default
  }

  const typologyData = getTypologyData(typology)
  const deathCauseData = getDeathCauseData(death_cause)

  // Base style for the marker (Invisible anchor to match Mapbox circle)
  const renderMarker = () => (
    <div className={cn(
      "relative flex items-center justify-center rounded-full transition-all duration-300",
      // Base size to match map (approx 6px radius -> 12px diameter)
      "w-3 h-3",
      // Only show styles if highlighted/pulsing, otherwise transparent to let map layer show through
      highlight && "scale-150 z-50 ring-2 ring-yellow-400 bg-blue-600",
      halo && "ring-4 opacity-50 bg-blue-600",
      pulse && "animate-pulse bg-blue-600"
    )}
      style={{
        // Transparent by default
        backgroundColor: (highlight || halo || pulse) ? COLORS.animitas : 'transparent',
        boxShadow: (highlight || halo || pulse) ? '0 0 0 2px white' : 'none',
      }}
    />
  )

  // Detailed View (Always render Popover since we only render this component for focused items)
  // Detailed View (Always render Popover since we only render this component for focused items)
  return (
    <Popover open={true}>
      <PopoverTrigger asChild>
        <div className={cn("relative flex flex-col items-center group z-50 cursor-pointer", className)}>
          {renderMarker()}
          {/* Name absolutely positioned below the circle */}
          <div className="absolute top-full mt-8 whitespace-nowrap pointer-events-none">
            <span className="font-ibm-plex-mono uppercase text-sm font-medium text-black">
              {name || 'Animita'}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={20}
        collisionPadding={10}
        disablePortal={true}
        className="bg-transparent border-none shadow-none p-0 w-auto"
      >
        {/* Connector Line */}
        <PopoverArrow
          className="fill-black stroke-black"
          width={12}
          height={20}
          asChild
        >
          <svg width="12" height="20" viewBox="0 0 12 20" style={{ overflow: 'visible' }}>
            <line
              x1="6" y1="0" x2="6" y2="20"
              stroke="#666666ff"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          </svg>
        </PopoverArrow>

        <Card className="z-10 w-80 !py-0 overflow-hidden">
          {images && images.length > 0 && (
            <Carousel className="w-full h-full overflow-hidden aspect-video">
              <CarouselContent className="h-full ml-0">
                {images.map((img, idx) => (
                  <CarouselItem key={idx} className="pl-0 h-full">
                    <img
                      src={img}
                      alt={`${name} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 size-6" />
                  <CarouselNext className="right-2 size-6" />
                </>
              )}
            </Carousel>
          )}

          <Link
            href={`/animita/${id}`}
            className="block w-full hover:bg-neutral-50 transition-colors group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-4 space-y-3">
              {/* Properties List */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Tipología</Label>
                  <span className="text-sm font-normal text-black">{typologyData.label}</span>
                </div>

                <div className="space-y-1.5">
                  <Label>Causa de Muerte</Label>
                  <span className="text-sm font-normal text-black">{deathCauseData.label}</span>
                </div>

                {site?.insights?.patrimonial?.antiquity_year && (
                  <div className="space-y-1.5">
                    <Label>Antigüedad</Label>
                    <span className="text-sm font-normal text-black">{site.insights.patrimonial.antiquity_year}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Link>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
