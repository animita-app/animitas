import React from "react"
import { HeritageSite } from "@/types/mock"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"

interface CreatorSectionProps {
  site: HeritageSite
}

export function CreatorSection({ site }: CreatorSectionProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{site.created_by.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-sm font-medium">{site.created_by.name}</span>
          <span className="text-sm text-muted-foreground">{new Date(site.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-black">
        <MoreHorizontal />
      </Button>
    </div>
  )
}
