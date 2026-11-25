"use client"

import Image from "next/image"
import type React from "react"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { animitaHref } from '@/lib/routes'
import { TABLES } from '@/lib/animitas'

interface NotificationData {
  id: string
  title: string
  description: string
  timeAgo: string
  href: string
}

export function NotificationsBell({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { currentUser } = useUser()
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  useEffect(() => {
    if (!currentUser) return
    const userId = currentUser.id
    let cancelled = false

    async function fetchNotifications() {
      const supabase = createClient()
      const { data: mySites } = await supabase
        .from(TABLES.animitas)
        .select('id')
        .eq('creator_id', userId)

      if (!mySites?.length) {
        if (!cancelled) setNotifications([])
        return
      }

      const { data: comments } = await supabase
        .from(TABLES.comments)
        .select('id, content, created_at, user_id, heritage_sites(title, slug), user_profiles!user_id(display_name)')
        .in('site_id', mySites.map(s => s.id))
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (cancelled || !comments) return
      setNotifications(comments.map((c: any) => ({
        id: c.id,
        title: `${c.user_profiles?.display_name || 'Alguien'} dejó un recuerdo en ${c.heritage_sites?.title || 'tu animita'}`,
        description: `«${c.content}»`,
        timeAgo: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es }),
        href: animitaHref(c.heritage_sites?.slug),
      })))
    }

    fetchNotifications()
    return () => { cancelled = true }
  }, [currentUser])

  if (!currentUser) return null

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            {/* An old letter, like the ones left at an animita, sealed in wax when a recuerdo is new. */}
            <button
              type="button"
              aria-label={notifications.length ? `Recuerdos nuevos (${notifications.length})` : "Recuerdos"}
              className="relative flex size-11 items-center justify-center rounded-xs outline-none transition-[scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:rotate-3 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:scale-110 motion-reduce:transition-none"
            >
              <Image src="/cutouts/envelope.png" alt="" width={240} height={138} draggable={false} className="h-7 w-auto -rotate-6 drop-shadow-[0_2px_2px_rgb(28_24_20_/_0.35)]" />
              {notifications.length > 0 && <span aria-hidden className="wax-seal absolute top-2.5 right-1.5 size-3.5 rotate-12" />}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Recuerdos</TooltipContent>
      </Tooltip>

      {/* Recuerdos left on your animitas, as loose notes dealt out under the letter. */}
      <DropdownMenuContent align="end" sideOffset={4} className="scroll-fade flex max-h-(--radix-dropdown-menu-content-available-height) w-80 flex-col gap-3 bg-transparent p-3 shadow-none">
        <DropdownMenuLabel className="sr-only">Recuerdos en tus animitas</DropdownMenuLabel>
        {notifications.length === 0 ? (
          <p className="paper-slip plate-deal rotate-1 px-4 py-3 text-pretty text-sm text-text-weak">
            Cuando alguien deje un recuerdo en tus animitas, va a llegar acá.
          </p>
        ) : (
          notifications.map((item, i) => (
            <DropdownMenuItem
              asChild
              key={item.id}
              style={{ '--i': i } as React.CSSProperties}
              className={cn(
                "paper-slip plate-deal flex-col items-start gap-1 rounded-none px-4 py-3 transition-[translate,rotate] duration-150 data-[highlighted]:bg-transparent data-[highlighted]:rotate-0 data-[highlighted]:-translate-x-1",
                i % 2 ? "rotate-1" : "-rotate-[0.6deg]"
              )}
            >
              <Link href={item.href}>
                <span className="text-pretty text-sm text-text-strong">{item.title}</span>
                <span className="text-pretty text-sm text-text">{item.description}</span>
                <span className="text-xs text-text-weak">{item.timeAgo}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
