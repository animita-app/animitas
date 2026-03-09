import React from "react"
import { HeritageSite } from "@/types/heritage"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InfoBlock } from "./info-block"

interface CreatorSectionProps {
  site: HeritageSite
}

export function CreatorSection({ site }: CreatorSectionProps) {
  const creatorName = site.created_by?.name || 'Anónimo'
  const creatorInitial = creatorName[0]?.toUpperCase() || 'A'
  const antiquityYear = site.insights?.patrimonial?.antiquity_year

  return (
    <div className="grid grid-cols-2 gap-4 items-start">
      <InfoBlock label="Creado por">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{creatorInitial}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-normal text-text-strong">{creatorName}</span>
        </div>
      </InfoBlock>

      <InfoBlock label="Publicado">
        <span className="text-sm font-normal text-text-strong">
          {new Date(site.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </InfoBlock>

      {antiquityYear && (
        <InfoBlock label="Fundado circa">
          <span className="text-sm font-normal text-text-strong">{antiquityYear}</span>
        </InfoBlock>
      )}
    </div>
  )
}
