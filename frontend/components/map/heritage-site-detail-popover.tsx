import { useRouter } from 'next/navigation'
import { HeritageSite } from '@/types/mock'
import { ICONS } from '@/lib/map-style'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Calendar, User, MapPin, Activity, Heart, Camera } from "lucide-react"
import Image from 'next/image'

interface HeritageSiteDetailPopoverProps {
  heritageSite?: HeritageSite
  id?: string
  name?: string
  images?: string[]
  typology?: string
  death_cause?: string
  open?: boolean
  onClose?: () => void
  children?: React.ReactNode
  isFree?: boolean
}

export const HeritageSiteDetailPopover = ({
  heritageSite,
  id: propId,
  name: propName,
  images: propImages,
  typology: propTypology,
  death_cause: propDeathCause,
  children,
  open,
  isFree,
  ...props
}: HeritageSiteDetailPopoverProps) => {
  const router = useRouter()

  // Extract values from site object or fallback to props
  const name = heritageSite?.title || propName
  const typology = heritageSite?.typology || propTypology
  const death_cause = heritageSite?.insights?.memorial?.death_cause || propDeathCause
  const id = heritageSite?.id || propId
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

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (slug && kind) {
      router.push(`/${kind}/${slug}`)
    }
  }

  return (
    <div className="relative flex flex-col items-center group cursor-pointer w-0 h-0">
      {/* Custom Marker Content (e.g. Image) */}
      <div className="-mt-6 relative z-20">
        {children}
      </div>

      {open && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-30">
          <span className="font-ibm-plex-mono uppercase text-sm font-medium text-black">
            {name || 'Animita'}
          </span>
        </div>
      )}

      {open || !isFree && (
        <div className="absolute bottom-full mb-12 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <Card
            className="w-72 !py-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-md border-none shadow-md"
            onClick={handleCardClick}
          >
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <Label>Tipología</Label>
                <p className="text-sm font-medium text-black">{typologyData.label}</p>
              </div>

              <div className="space-y-1">
                <Label>Causa de Muerte</Label>
                <p className="text-sm font-medium text-black">{deathCauseData.label}</p>
              </div>

              {heritageSite?.insights?.patrimonial?.antiquity_year && (
                <div className="space-y-1">
                  <Label>Antigüedad</Label>
                  <p className="text-sm font-medium text-black">{heritageSite.insights.patrimonial.antiquity_year}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
