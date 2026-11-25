"use client"

import { Animita } from "@/types/animita"
import { MainInfo } from "./info-sidebar-components/main-info"
import { CreatorSection } from "./info-sidebar-components/creator-section"
import { Velas } from "./info-sidebar-components/velas"
import { CommentsSection } from "./info-sidebar-components/comments-section"

export function AnimitaDetails({ site }: { site: Animita }) {
  return (
    <div className="space-y-8">
      <MainInfo site={site} />
      <Velas siteId={site.id} />
      <CreatorSection site={site} />
      <CommentsSection siteId={site.id} />
    </div>
  )
}
