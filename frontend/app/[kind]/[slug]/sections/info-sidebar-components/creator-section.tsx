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

  return (
    <div className="select-none grid grid-cols-2 gap-6 items-start">
      <InfoBlock label="Creado por">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-[10px]">{creatorInitial}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-normal text-text-strong truncate">{creatorName}</span>
        </div>
      </InfoBlock>

      <InfoBlock label="Publicado">
        <span className="text-sm font-normal text-text-strong">
          {new Date(site.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </InfoBlock>

      <InfoBlock label="Categoría">
        <span className="text-sm font-normal text-text-strong tracking-tight">
          {site.categories?.length
            ? site.categories.map(c => c.name).join(', ')
            : (site.kind?.category?.name || 'Patrimonio')}
        </span>
      </InfoBlock>

      <InfoBlock label="Tipo">
        <span className="text-sm font-normal text-text-strong capitalize">
          {site.kind?.name || 'Memorial'}
        </span>
      </InfoBlock>
    </div>
  )
}
