import { Button } from '@/components/ui/button'
import React from "react"
import { ArrowUpRight } from "lucide-react"
import { Animita } from "@/types/animita"
import { directionsUrl, shortAddress } from "@/lib/location"
import { InfoBlock } from "./info-block"

interface CreatorSectionProps {
  site: Animita
}

// Where it is with the way there on the same row, then who added it and when, said in one line.
export function CreatorSection({ site }: CreatorSectionProps) {
  const creatorName = site.created_by?.name || 'Anónimo'
  const place = shortAddress(site.address, site.city_region)
  const published = new Date(site.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="flex flex-col gap-8">
      {site.location && (
        <InfoBlock label="Dónde está">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            {place && <p className="text-pretty text-sm text-text-strong">{place}</p>}
            <Button asChild variant="sign-service" className="-rotate-1">
              <a href={directionsUrl(site.location)} target="_blank" rel="noopener noreferrer">
                Cómo llegar
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
          </div>
        </InfoBlock>
      )}

      <p className="text-pretty text-sm text-text-weak">
        Añadida por <span className="text-text-strong">{creatorName}</span> el {published}
      </p>
    </div>
  )
}
