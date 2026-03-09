"use client"

import React from "react"
import { HeritageSite } from "@/types/heritage"
import { Scroller } from "@/components/ui/scroller"
import { MainInfo } from "./info-sidebar-components/main-info"
import { SidebarHeader } from "./sidebar-header"
import { CommentsSection } from "./info-sidebar-components/comments-section"
import { ReactionsAndViews } from "./info-sidebar-components/reactions-and-views"
import { CreatorSection } from "./info-sidebar-components/creator-section"
import { PollSection } from "./info-sidebar-components/poll-section"
import { InsightsSection } from "./info-sidebar-components/insights-section"
import { useUser } from "@/contexts/user-context"

interface InfoSidebarProps {
  site: HeritageSite
}

export function InfoSidebar({ site }: InfoSidebarProps) {
  const { researchMode } = useUser()

  return (
    <aside className="w-full md:max-w-md flex flex-col bg-background-weak md:min-h-svh h-full">
      <SidebarHeader site={site} />
      <Scroller className="flex-1">
        <div className="p-6 md:p-8 space-y-8 pb-24">
          <MainInfo site={site} />
          <CreatorSection site={site} />
          {researchMode ? null : <PollSection siteId={site.id} />}
          <InsightsSection site={site} />
          <ReactionsAndViews site={site} />
          <CommentsSection siteId={site.id} />
        </div>
      </Scroller>
    </aside>
  )
}
