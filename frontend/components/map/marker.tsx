import React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AnimitaProperty } from './layers/types'
import Link from 'next/link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Site } from '@/types/mock'
import { ArrowUpRight } from 'lucide-react'
import { COLORS, ICONS } from '@/lib/map-style'

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

  // Base style for the marker (Circle with Dot)
  const renderMarker = () => (
    <div className={cn(
      "relative flex items-center justify-center w-6 h-6 rounded-full border-2",
      highlight && "ring-4 ring-yellow-400 scale-110 z-50",
      halo && "ring-4 opacity-50",
      pulse && "animate-pulse"
    )}
      style={{
        borderColor: COLORS.animitas,
        boxShadow: halo ? `0 0 0 4px ${COLORS.animitas}80` : 'none'
      }}
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.animitas }} />
    </div>
  )

  // Detailed View (Zoomed In)
  if (zoomedIn) {
    return (
      <Popover open={true}>
        <PopoverTrigger asChild>
          <div className={cn("relative flex flex-col items-center group z-50 cursor-pointer", className)}>
            {renderMarker()}
            {/* Name absolutely positioned below the circle */}
            <div className="absolute top-full mt-2 whitespace-nowrap">
              <span
                className="font-ibm-plex-mono text-xs font-medium uppercase text-white"
                style={{ textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000' }}
              >
                {name || 'Animita'}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          sideOffset={30}
          disablePortal={true}
          className="bg-transparent border-none shadow-none text-black font-ibm-plex-mono uppercase"
        >
          {/* Dotted Line Visual */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-px h-8 border-l-2 border-dotted border-black" />

          <div className="flex flex-col gap-0">
            {/* Properties Grid */}
            <div className="grid grid-cols-2 *:-mr-0.5 border-2 border-black divide-x-2 divide-y-2 divide-black bg-white">
              <div className="p-2 flex flex-col justify-center">
                <span className="text-xs opacity-60 uppercase leading-none mb-1">Tipología</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm leading-tight">{typologyData.label}</span>
                </div>
              </div>
              <div className="p-2 flex flex-col justify-center">
                <span className="text-xs opacity-60 uppercase leading-none mb-1">Causa</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm leading-tight">{deathCauseData.label}</span>
                </div>
              </div>

              {site?.insights?.patrimonial?.antiquity_year && (
                <div className="p-2 flex flex-col justify-center border-black">
                  <span className="text-xs opacity-60 uppercase leading-none mb-1">Antigüedad</span>
                  <span className="font-medium text-sm leading-tight">{site.insights.patrimonial.antiquity_year}</span>
                </div>
              )}

              {site?.insights?.patrimonial?.size && (
                <div className="p-2 flex flex-col justify-center">
                  <span className="text-xs opacity-60 uppercase leading-none mb-1">Tamaño</span>
                  <span className="font-medium text-sm leading-tight">
                    {site.insights.patrimonial.size}
                  </span>
                </div>
              )}

              {site?.insights?.memorial?.social_roles && site.insights.memorial.social_roles.length > 0 && (
                <div className="p-2 flex flex-col justify-center col-span-2">
                  <span className="text-xs opacity-60 uppercase leading-none mb-1">Roles</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {site.insights.memorial.social_roles.map(role => {
                      const roleData = ICONS.socialRoles[role as keyof typeof ICONS.socialRoles] || ICONS.socialRoles.default
                      return (
                        <span key={role} className="inline-flex items-center gap-1 bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">
                          <span>{roleData.label}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Link */}
            {id && (
              <Link
                href={`/animita/${id}`}
                className="bg-white border-x-2 border-b-2 underline-offset-4 border-black flex gap-1.5 [&_svg]:size-4 hover:underline items-center justify-center text-accent p-2"
                style={{ color: COLORS.animitas }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm font-medium uppercase">Ver Detalle </span>
                <ArrowUpRight />
              </Link>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Standard View (Zoomed Out)
  return (
    <div className={cn("flex-col flex items-center justify-center text-center group cursor-pointer", className)}>
      <div className="relative flex items-center justify-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {renderMarker()}
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{name || 'Animita'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Secondary Badge (Death Cause) - Optional in standard view */}
        {activeProperties.includes('death_cause') && death_cause && (
          <div className="absolute -top-1 -right-1 size-3 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[8px] shadow-sm z-10">
            <deathCauseData.icon size={10} />
          </div>
        )}
      </div>

      <h3
        className="text-sm font-medium text-black uppercase font-ibm-plex-mono mt-1 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ textShadow: '1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff' }}
      >
        {name || 'Animita'}
      </h3>
    </div>
  )
}
