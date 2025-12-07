"use client"

import React from "react"
import { HeritageSite } from "@/types/mock"
import { CURRENT_USER } from "@/constants/users"
import { ROLES } from "@/types/roles"
import { Scroller } from "@/components/ui/scroller"
import { MainInfo } from "./info-sidebar-components/main-info"
import { InsightsInfo } from "./info-sidebar-components/insights-info"
import { CommentsSection } from "./info-sidebar-components/comments-section"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ReactionsAndViews } from "./info-sidebar-components/reactions-and-views"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CreatorSection } from "./info-sidebar-components/creator-section"


interface InfoSidebarProps {
  site: HeritageSite
}

export function InfoSidebar({ site }: InfoSidebarProps) {
  const isFreeUser = CURRENT_USER.role === ROLES.FREE

  return (
    <aside className="w-1/3 flex flex-col border-l border-border-weak bg-background-weak h-full">
      {/* Scrollable Content */}
      <Scroller className="flex-1">
        <div className="p-6 md:p-8 space-y-8">

          <MainInfo site={site} />

          <CreatorSection site={site} />

          <ReactionsAndViews />

          {!isFreeUser && (
            <InsightsInfo site={site} />
          )}

          <CommentsSection />
        </div>
      </Scroller>
    </aside>
  )
}
