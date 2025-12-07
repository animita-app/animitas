import { cn } from "@/lib/utils"
import React from "react"
import { HeritageSite } from "@/types/mock"
import { Button } from "@/components/ui/button"

interface MainInfoProps {
  site: HeritageSite
}

export function MainInfo({ site }: MainInfoProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div>
      <h1 className="text-xl font-medium text-black">{site.title}</h1>
      <p
        className={cn(
          "mt-4 text-sm leading-relaxed text-black/70 whitespace-pre-line",
          !isExpanded && "line-clamp-4"
        )}
      >
        {site.story}
      </p>
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-accent hover:text-accent/80"
        size="sm"
        variant="link"
      >
        {isExpanded ? "Leer menos" : "Leer más"}
      </Button>
    </div>
  )
}
