"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SmilePlus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmojiPicker } from "@/components/ui/emoji-picker"
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

  const [visitCount, setVisitCount] = useState<number>(site.digital_visit_count ?? 0)

  useEffect(() => {
    const sessionKey = `viewed_${site.id}`
    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')

    async function trackView() {
      const supabase = createClient()
      // Increment visit count in DB
      const { data, error } = await supabase.rpc('increment_visit_count', { site_id_param: site.id })

      if (error) {
        // Fallback: manual increment if RPC fails
        const { data: siteData } = await supabase.from('heritage_sites').select('digital_visit_count').eq('id', site.id).single()
        const newCount = (siteData?.digital_visit_count ?? 0) + 1
        await supabase.from('heritage_sites').update({ digital_visit_count: newCount }).eq('id', site.id)
        setVisitCount(newCount)
      } else if (data !== undefined) {
        setVisitCount(data)
      }
    }

    trackView()
  }, [site.id])

  const hasAnyReaction = reactions.some((r) => r.hasReacted)

  if (loading) return (
    <div className="flex items-center gap-1.5 w-full">
      <Button variant="outline" size="icon" className="size-8 [&_svg]:opacity-50 shrink-0" disabled>
        <SmilePlus />
      </Button>
    </div>
  )

  return (
    <div className="flex items-center gap-1.5 w-full flex-wrap">
      {!hasAnyReaction && (
        <EmojiPicker
          onSelect={toggleReaction}
          trigger={
            <Button variant="outline" size="icon" className="size-8 [&_svg]:opacity-50 shrink-0">
              <SmilePlus />
            </Button>
          }
        />
      )}

      <TooltipProvider>
        {reactions.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                onClick={() => toggleReaction(reaction.emoji)}
                className={cn(
                  "bg-background h-8 font-normal gap-1 transition-colors cursor-pointer font-medium",
                  reaction.hasReacted && "border-[1.5px] border-text-strong text-text-strong bg-text-strong/5 hover:bg-text-strong/10"
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {reaction.hasReacted ? 'Quitar reacción' : 'Reaccionar'}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>

      {visitCount > 0 && (
        <div className="ml-auto flex items-center gap-1.5 text-sm text-text-weak mr-1">
          <Eye className="size-4" />
          <span>{visitCount}</span>
        </div>
      )}
    </div>
  )
}
