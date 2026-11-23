"use client"

import React from "react"
import { HeritageSite } from "@/types/heritage"
import { Scroller } from "@/components/ui/scroller"
import { MainInfo } from "./info-sidebar-components/main-info"
import { CreatorSection } from "./info-sidebar-components/creator-section"
import { Velas } from "./info-sidebar-components/velas"
import { CommentsSection } from "./info-sidebar-components/comments-section"

interface InfoSidebarProps {
  site: HeritageSite
}

export function InfoSidebar({ site }: InfoSidebarProps) {
  return (
    <aside className="w-full md:max-w-md flex flex-col bg-background-weak md:min-h-svh md:flex-1 md:min-h-0">
      <Scroller className="flex-1">
        <div className="p-6 md:p-8 space-y-8 pb-24">
          <MainInfo site={site} />
          <Velas siteId={site.id} />
          <CreatorSection site={site} />
          <CommentsSection siteId={site.id} />
        </div>
      </Scroller>
    </aside>
  )
}
