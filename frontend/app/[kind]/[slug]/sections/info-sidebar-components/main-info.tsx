import React from "react"
import { HeritageSite } from "@/types/mock"

interface MainInfoProps {
  site: HeritageSite
}

export function MainInfo({ site }: MainInfoProps) {
  return (
    <div>
      <h1 className="text-xl font-bold text-black">{site.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
        {site.story}
      </p>
    </div>
  )
}
