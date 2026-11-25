"use client"

import { Animita } from "@/types/animita"
import { Button } from "@/components/ui/button"
import { animitaHref } from "@/lib/routes"
import { MainInfo } from "./info-sidebar-components/main-info"
import { CreatorSection } from "./info-sidebar-components/creator-section"
import { Velas } from "./info-sidebar-components/velas"
import { CommentsSection } from "./info-sidebar-components/comments-section"

// The sheet over the map is short on purpose: who, the start of the story, a candle and the way there.
// The whole story, editing and the recuerdos live on the full page.
export function AnimitaDetails({ site, compact = false }: { site: Animita; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col gap-8">
        <MainInfo site={site} compact />
        <Velas siteId={site.id} />
        <CreatorSection site={site} />
        <Button asChild variant="sign" size="lg" className="self-start rotate-1">
          {/* A plain link on purpose: the router would open this same sheet again instead of the page. */}
          <a href={animitaHref(site.slug)}>Ver ficha completa</a>
        </Button>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <MainInfo site={site} />
      <Velas siteId={site.id} />
      <CreatorSection site={site} />
      <CommentsSection siteId={site.id} />
    </div>
  )
}
