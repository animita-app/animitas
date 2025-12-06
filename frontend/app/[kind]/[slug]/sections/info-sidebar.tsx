"use client"

import React from "react"
import { HeritageSite } from "@/types/mock"
import { CURRENT_USER } from "@/constants/users"
import { ROLES } from "@/types/roles"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Scroller } from "@/components/ui/scroller"
import { CreatorSection } from "./info-sidebar-components/creator-section"
import { MainInfo } from "./info-sidebar-components/main-info"
import { InsightsInfo } from "./info-sidebar-components/insights-info"
import { CommentsSection } from "./info-sidebar-components/comments-section"
import { CommentInput } from "./info-sidebar-components/comment-input"

interface InfoSidebarProps {
  site: HeritageSite
}

export function InfoSidebar({ site }: InfoSidebarProps) {
  const isEditor = CURRENT_USER.role === ROLES.EDITOR
  const isFreeUser = CURRENT_USER.role === ROLES.FREE

  // Mock reflections data or empty state
  const reflections = [
    { user: "jdoe", text: "Looks good" },
    // Add real data handling if available, for now just UI structure
  ]

  return (
    <aside className="w-1/3 flex flex-col border-l bg-background h-full">
      {/* Scrollable Content */}
      <Scroller className="flex-1">
        <div className="p-6 space-y-6">
          <CreatorSection site={site} />

          <MainInfo site={site} />

          {!isFreeUser && (
            <InsightsInfo site={site} />
          )}

          <Separator />

          <CommentsSection />

          {/* Editor Panel */}
          {isEditor && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50 mt-8">
              <h4 className="font-semibold text-sm mb-2 text-red-800 dark:text-red-500">Panel de Editor</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full border-red-200 text-red-800">
                  Editar Historia
                </Button>
              </div>
            </div>
          )}
        </div>
      </Scroller>

      <CommentInput />
    </aside>
  )
}
