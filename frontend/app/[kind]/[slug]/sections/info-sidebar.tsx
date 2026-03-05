"use client"

import React from "react"
import { HeritageSite } from "@/types/heritage"
import { useUser } from "@/contexts/user-context"
import { ROLES } from "@/types/roles"
import { Scroller } from "@/components/ui/scroller"
import { MainInfo } from "./info-sidebar-components/main-info"
import { CommentsSection } from "./info-sidebar-components/comments-section"
import { ReactionsAndViews } from "./info-sidebar-components/reactions-and-views"
import { CreatorSection } from "./info-sidebar-components/creator-section"
import { PollSection } from "./info-sidebar-components/poll-section"
import { DetailedInfoSection } from "./info-sidebar-components/detailed-info-section"
import { RevisionHistory } from "./info-sidebar-components/revision-history"

interface InfoSidebarProps {
  site: HeritageSite
}

export function InfoSidebar({ site }: InfoSidebarProps) {
  const { role, researchMode } = useUser()
  const isDefaultUser = role === ROLES.DEFAULT

  return (
    <aside className="w-full md:max-w-md flex flex-col bg-background-weak md:min-h-svh h-full">
      {/* Scrollable Content */}
      <Scroller className="flex-1">
        <div className="p-6 md:p-8 space-y-8 pb-24">
          <MainInfo site={site} />

          <CreatorSection site={site} />

          {researchMode ? (
            <>
              <DetailedInfoSection site={site} />
              <RevisionHistory siteId={site.id} />
            </>
          ) : (
            <PollSection siteId={site.id} />
          )}

          <ReactionsAndViews site={site} />

          <CommentsSection />
        </div>
      </Scroller>
    </aside>
  )
}
