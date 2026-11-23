"use client"

import { HeritageSite } from "@/types/heritage"
import { Scroller } from "@/components/ui/scroller"
import { AnimitaDetails } from "./animita-details"

export function InfoSidebar({ site }: { site: HeritageSite }) {
  return (
    <aside className="w-full md:max-w-md flex flex-col bg-background-weak md:min-h-svh md:flex-1 md:min-h-0">
      <Scroller className="flex-1">
        <div className="p-6 md:p-8 pb-24">
          <AnimitaDetails site={site} />
        </div>
      </Scroller>
    </aside>
  )
}
