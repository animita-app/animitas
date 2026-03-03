import React from "react"
import { HeritageSite } from "@/types/mock"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InfoBlock } from "./info-block"

interface CreatorSectionProps {
  site: HeritageSite
}

export function CreatorSection({ site }: CreatorSectionProps) {
  const creatorName = site.created_by?.name || 'Anonymous'
  const creatorInitial = creatorName[0]?.toUpperCase() || 'A'

  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      <InfoBlock label="Creado por">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{creatorInitial}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-normal text-black">{creatorName}</span>
        </div>
      </InfoBlock>

      <InfoBlock label="Fecha">
        <span className="text-sm font-normal text-black">
          {new Date(site.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </InfoBlock>
    </div>
  )
}
