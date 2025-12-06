"use client"

import React from "react"
import { HeritageSite } from "@/types/mock"
import { CURRENT_USER } from "@/constants/users"
import { ROLES } from "@/types/roles"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Paperclip } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Scroller } from "@/components/ui/scroller"

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
          {/* Header: Author & Meta */}
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

          {/* Title & Description */}
          <div>
            <h1 className="text-xl font-bold text-black">{site.title}</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {site.story}
            </p>
          </div>

          {/* Insights (Tags style) for Non-Free Users */}
          {!isFreeUser && site.insights && (
            <div className="flex flex-wrap gap-2">
              {site.insights.memorial?.death_cause && (
                <Badge variant="secondary" className="rounded-md font-normal text-sm">
                  #Causa: {site.insights.memorial.death_cause}
                </Badge>
              )}
              {site.insights.patrimonial?.antiquity_year && (
                <Badge variant="secondary" className="rounded-md font-normal text-sm">
                  #Antigüedad: {site.insights.patrimonial.antiquity_year}
                </Badge>
              )}
              {site.insights.patrimonial?.size && (
                <Badge variant="secondary" className="rounded-md font-normal text-sm">
                  #Tamaño: {site.insights.patrimonial.size}
                </Badge>
              )}
              <Badge variant="secondary" className="rounded-md font-normal text-sm">
                #{site.kind}
              </Badge>
            </div>
          )}

          <Separator />

          {/* Reflections List Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">Reflexiones</span>
              <span className="text-sm text-muted-foreground">Más recientes</span>
            </div>
            {/* Placeholder for list */}
            <div className="text-sm text-muted-foreground italic">
              No hay reflexiones aún. Sé el primero.
            </div>
          </div>

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

      {/* Fixed Bottom Input */}
      <div className="p-4 border-t bg-background">
        <div className="relative rounded-xl border bg-muted/30 focus-within:ring-1 focus-within:ring-ring focus-within:bg-background transition-all">
          <Textarea
            placeholder="Escribe una reflexión..."
            className="min-h-[44px] w-full resize-none border-0 bg-transparent py-3 px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <div className="flex items-center justify-between px-3 pb-2 pt-0">
            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Paperclip />
            </Button>
            <Button size="sm" className="text-sm px-3">
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
