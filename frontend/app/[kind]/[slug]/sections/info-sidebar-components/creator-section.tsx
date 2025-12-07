import React from "react"
import { HeritageSite } from "@/types/mock"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InfoBlock } from "./info-block"

interface CreatorSectionProps {
  site: HeritageSite
}

export function CreatorSection({ site }: CreatorSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 items-center">
      <InfoBlock label="Creado por">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{site.created_by.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-normal text-black">{site.created_by.name}</span>
        </div>
      </InfoBlock>

      <InfoBlock label="Fecha">
        <span className="text-sm font-normal text-black capitalize">
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
