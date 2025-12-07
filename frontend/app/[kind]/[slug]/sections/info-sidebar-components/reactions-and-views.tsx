"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { SmilePlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface Reaction {
  emoji: string
  count: number
  users: string[]
}

const INITIAL_REACTIONS: Reaction[] = [
  { emoji: "🙏", count: 12, users: ["pype", "fmoure", "jkarich", "ana", "lvalenzuela"] },
  { emoji: "🕯️", count: 8, users: ["juan", "maria", "pedro"] },
  { emoji: "❤️", count: 5, users: ["sofia", "carlos"] },
]

const AVAILABLE_EMOJIS = ["🙏", "🕯️", "❤️", "🌺", "✨", "🕊️"]

export function ReactionsAndViews() {
  const [reactions, setReactions] = useState<Reaction[]>(INITIAL_REACTIONS)

  const hasReacted = reactions.some((r) => r.users.includes("Tú"))

  const handleAddReaction = (emoji: string) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji)
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, users: ["Tú", ...r.users] }
            : r
        )
      }
      return [...prev, { emoji, count: 1, users: ["Tú"] }]
    })
  }

  return (
    <div className="flex items-center gap-1.5 w-full">
      {!hasReacted && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="size-6 shrink-0">
              <SmilePlus />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="hover:bg-neutral-800 rounded p-1 text-lg aspect-square cursor-pointer"
                  onClick={() => handleAddReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <TooltipProvider>
        {reactions.map((reaction) => {
          const isUserReaction = reaction.users.includes("Tú")
          return (
            <Tooltip key={reaction.emoji}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 font-normal text-black gap-1",
                    isUserReaction && "border-accent text-accent bg-accent/5"
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="mb-1.5 max-w-32 text-nowrap overflow-hidden text-ellipsis">
                {reaction.users.join(", ")}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>

      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
        <Eye className="w-3.5 h-3.5" />
        <span>1.2k</span>
      </div>
    </div>
  )
}
