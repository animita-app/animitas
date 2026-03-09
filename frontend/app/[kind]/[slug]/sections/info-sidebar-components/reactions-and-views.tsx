"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SmilePlus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { HeritageSite } from "@/types/heritage"

const AVAILABLE_EMOJIS = ["🙏", "🕯️", "❤️", "🌺", "✨", "🕊️"]

interface Reaction {
  emoji: string
  count: number
  hasReacted: boolean
}

interface ReactionsAndViewsProps {
  site: HeritageSite
}

export function ReactionsAndViews({ site }: ReactionsAndViewsProps) {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useUser()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReactions() {
      const supabase = createClient()
      const { data } = await supabase
        .from('heritage_site_reactions')
        .select('emoji, user_id')
        .eq('site_id', site.id)

      if (!data) { setLoading(false); return }

      const grouped: Record<string, { count: number; hasReacted: boolean }> = {}
      data.forEach((r: any) => {
        if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, hasReacted: false }
        grouped[r.emoji].count++
        if (r.user_id === currentUser?.id) grouped[r.emoji].hasReacted = true
      })

      setReactions(Object.entries(grouped).map(([emoji, d]) => ({ emoji, ...d })))
      setLoading(false)
    }
    fetchReactions()
  }, [site.id, currentUser?.id])

  const toggleReaction = async (emoji: string) => {
    if (!isAuthenticated || !currentUser) { router.push('/auth'); return }

    const existing = reactions.find((r) => r.emoji === emoji)
    const isRemoving = existing?.hasReacted

    setReactions((prev) => {
      if (isRemoving) {
        return prev
          .map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r)
          .filter((r) => r.count > 0)
      }
      const found = prev.find((r) => r.emoji === emoji)
      if (found) return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r)
      return [...prev, { emoji, count: 1, hasReacted: true }]
    })

    const supabase = createClient()
    if (isRemoving) {
      await supabase.from('heritage_site_reactions').delete()
        .eq('site_id', site.id).eq('user_id', currentUser.id).eq('emoji', emoji)
    } else {
      await supabase.from('heritage_site_reactions')
        .insert({ site_id: site.id, user_id: currentUser.id, emoji })
    }
  }

  const hasAnyReaction = reactions.some((r) => r.hasReacted)
  const visitCount = site?.insights?.spiritual?.digital_visit_count || 0

  if (loading) return <div className="h-8 animate-pulse bg-background-weaker rounded-md" />

  return (
    <div className="flex items-center gap-1.5 w-full flex-wrap">
      {!hasAnyReaction && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="size-6 shrink-0">
              <SmilePlus />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div className="grid grid-cols-6 gap-2 p-1">
              {AVAILABLE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="hover:bg-background-weaker rounded p-1 text-lg aspect-square cursor-pointer"
                  onClick={() => toggleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <TooltipProvider>
        {reactions.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                onClick={() => toggleReaction(reaction.emoji)}
                className={cn(
                  "bg-background h-6 font-normal gap-1 transition-colors cursor-pointer",
                  reaction.hasReacted && "border-accent text-accent bg-accent/5 hover:bg-accent/10"
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              {reaction.hasReacted ? 'Quitar reacción' : 'Reaccionar'}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>

      {visitCount > 0 && (
        <div className="ml-auto flex items-center gap-1.5 text-xs text-text-weak mr-1">
          <Eye className="size-3.5" />
          <span>{visitCount}</span>
        </div>
      )}
    </div>
  )
}
