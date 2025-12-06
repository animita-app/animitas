import React from "react"
import { HeritageSite } from "@/types/mock"
import { Badge } from "@/components/ui/badge"

interface InsightsInfoProps {
  site: HeritageSite
}

export function InsightsInfo({ site }: InsightsInfoProps) {
  if (!site.insights) return null

  return (
    <div className="flex flex-wrap gap-2">
      {site.insights.memorial?.death_cause && (
        <Badge variant="secondary" className="rounded-md font-normal text-sm">
          #Causa: {site.insights.memorial.death_cause}
        </Badge>
      )}
      {site.insights.patrimonial?.antiquity_year && (
        <Badge variant="secondary" className="rounded-md font-normal text-sm">
          #Antigüedad: {site.insights.patrimonial.antiquity_year}
        </Badge>
      )}
      {site.insights.patrimonial?.size && (
        <Badge variant="secondary" className="rounded-md font-normal text-sm">
          #Tamaño: {site.insights.patrimonial.size}
        </Badge>
      )}
      <Badge variant="secondary" className="rounded-md font-normal text-sm">
        #{site.kind}
      </Badge>
    </div>
  )
}
