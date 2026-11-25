import React from "react"
import { Navigation } from "lucide-react"
import { Animita } from "@/types/animita"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { directionsUrl } from "@/lib/location"
import { InfoBlock } from "./info-block"

interface CreatorSectionProps {
  site: Animita
}

export function CreatorSection({ site }: CreatorSectionProps) {
  const creatorName = site.created_by?.name || 'Anónimo'
  const place = [site.address, site.city_region].filter(Boolean).join(', ')

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 items-start">
      {site.location && (
        <InfoBlock label="Dónde está" className="col-span-2">
          {place && <p className="text-sm text-text-strong text-pretty">{place}</p>}
          <Button variant="outline" size="sm" asChild>
            <a href={directionsUrl(site.location)} target="_blank" rel="noopener noreferrer">
              <Navigation />
              Cómo llegar
            </a>
          </Button>
        </InfoBlock>
      )}

      <InfoBlock label="Agregada por">
        <div className="flex items-center gap-2">
          <Avatar className="size-6 shrink-0">
            <AvatarFallback className="text-xs">{creatorName[0]?.toUpperCase() || 'A'}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-text-strong">{creatorName}</span>
        </div>
      </InfoBlock>

      <InfoBlock label="Publicada">
        <span className="text-sm text-text-strong">
          {new Date(site.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </InfoBlock>
    </div>
  )
}
