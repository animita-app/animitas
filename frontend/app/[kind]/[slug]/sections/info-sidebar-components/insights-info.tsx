import React from "react"
import { HeritageSite } from "@/types/heritage"
import { Badge } from "@/components/ui/badge"

interface InsightsInfoProps {
  site: HeritageSite
}

export function InsightsInfo({ site }: InsightsInfoProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary" className="rounded-md font-normal text-sm">
        #{site.kind?.name || "Patrimonio"}
      </Badge>
    </div>
  )
}
