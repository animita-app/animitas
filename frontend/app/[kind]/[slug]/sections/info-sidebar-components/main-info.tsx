import React from "react"
import { HeritageSite } from "@/types/heritage"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { ROLES } from "@/types/roles"
import Link from "next/link"

interface MainInfoProps {
  site: HeritageSite
}

export function MainInfo({ site }: MainInfoProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { role } = useUser()
  const canEdit = role === ROLES.EDITOR || role === ROLES.SUPERADMIN

  const kindSlug = (site as any).kind || 'animita'
  const displayTitle = kindSlug === 'animita' ? `Animita de ${site.title}` : site.title

  return (
    <div>
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-medium text-black">{displayTitle}</h1>
        {canEdit && (
          <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-tight px-3" asChild>
            <Link href={`/${kindSlug}/${site.slug}/edit`}>
              Editar
            </Link>
          </Button>
        )}
      </div>

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
