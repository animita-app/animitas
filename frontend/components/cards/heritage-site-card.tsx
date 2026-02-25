import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowRight } from "lucide-react"

interface HeritageSiteCardProps {
  site: any // Replace with HeritageSite type if available
}

export function HeritageSiteCard({ site }: HeritageSiteCardProps) {
  const imageUrl = site.images && site.images.length > 0
    ? site.images[0]
    : "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2000&auto=format&fit=crop"

  return (
    <Card className="group overflow-hidden rounded-xl border-border-weak shadow-none transition-all hover:shadow-md h-full flex flex-col bg-background">
      <Link href={`/${site.kind?.toLowerCase() || 'animita'}/${site.slug}`} className="block relative aspect-square w-full overflow-hidden bg-background-weak">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={site.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-semibold text-text-strong uppercase tracking-wider backdrop-blur-md">
            {site.typology || site.kind || 'Patrimonio'}
          </span>
        </div>
      </Link>
      <CardContent className="p-4 flex flex-col gap-2 flex-grow justify-between">
        <div className="space-y-1">
          <h3 className="font-medium text-text-strong line-clamp-1">{site.title}</h3>
          <div className="flex items-center text-xs text-text-weak">
            <MapPin className="mr-1 h-3 w-3 shrink-0" />
            <span className="truncate">Lat: {site.location?.coordinates?.[1]?.toFixed(3) || '-'}, Lng: {site.location?.coordinates?.[0]?.toFixed(3) || '-'}</span>
          </div>
        </div>
        <div className="mt-2 text-xs font-medium text-accent flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          Ver detalles <ArrowRight className="h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  )
}
