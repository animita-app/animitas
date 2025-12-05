import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PopoverProps } from "@radix-ui/react-popover"
import { HeritageSite } from '@/types/mock'
import { ICONS } from '@/lib/map-style'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, MapPin, Activity, Heart, Camera } from "lucide-react"
import Image from 'next/image'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

interface HeritageSiteDetailPopoverProps extends PopoverProps {
  heritageSite?: HeritageSite
  id?: string
  name?: string
  images?: string[]
  typology?: string
  death_cause?: string
  open?: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export const HeritageSiteDetailPopover = ({
  heritageSite,
  id: propId,
  name: propName,
  images: propImages,
  typology: propTypology,
  death_cause: propDeathCause,
  children,
  onClose,
  open,
  ...props
}: HeritageSiteDetailPopoverProps) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Extract values from site object or fallback to props
  const lat = heritageSite?.location.lat
  const lng = heritageSite?.location.lng
  const id = heritageSite?.id || propId
  const name = heritageSite?.title || propName
  const images = heritageSite?.images || propImages || []
  const typology = heritageSite?.typology || propTypology
  const death_cause = heritageSite?.insights?.memorial?.death_cause || propDeathCause
  const kind = (heritageSite as any)?.kind || 'animita'
  const slug = heritageSite?.slug || id

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

  const handleCardClick = () => {
    if (slug && kind) {
      router.push(`/${kind}/${slug}`)
    }
  }

  if (!open) return null

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div ref={triggerRef} className="relative flex flex-col items-center group pointer-events-none w-0 h-0">
          <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
            <span className="font-ibm-plex-mono uppercase text-sm font-medium text-black">
              {name || 'Animita'}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={48}
        collisionPadding={10}
        disablePortal={true}
        className="bg-transparent border-none shadow-none p-0 w-auto pointer-events-none"
      >
        <Card className="z-10 w-80 !py-0 overflow-hidden pointer-events-auto cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
          <CardContent className="p-4 space-y-4">
            {/* Properties List */}
            <div className="space-y-1.5">
              <Label>Tipología</Label>
              <span className="text-sm font-normal text-black">{typologyData.label}</span>
            </div>

            <div className="space-y-1.5">
              <Label>Causa de Muerte</Label>
              <span className="text-sm font-normal text-black">{deathCauseData.label}</span>
            </div>

            {heritageSite?.insights?.patrimonial?.antiquity_year && (
              <div className="space-y-1.5">
                <Label>Antigüedad</Label>
                <span className="text-sm font-normal text-black">{heritageSite.insights.patrimonial.antiquity_year}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
