"use client"

import Image from "next/image"
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
import { CutoutText } from '@/components/cutout-text'
import { PenLoop } from '@/components/pen'
import { useUser } from '@/contexts/user-context'
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

  const count = notifications.length

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <div className="shelf shelf-top">
        <DropdownMenuTrigger asChild>
          {/* An old letter; the number of new recuerdos is circled next to it in pen. */}
          <button
            type="button"
            aria-label={count ? `Recuerdos nuevos (${count})` : "Recuerdos"}
            style={{ transformOrigin: '100% 0' }}
            className="shelf-item relative flex h-11 items-center gap-0.5 rounded-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="shelf-label pointer-events-none absolute left-1/2 top-1/2 z-10 size-0">
              <CutoutText text="recuerdos" height={20} orbit={{ radius: 64, angle: 120, clockwise: false }} />
            </span>
            <Image src="/cutouts/envelope.png" alt="" width={240} height={138} draggable={false} className="h-7 w-auto -rotate-6 drop-shadow-[0_2px_2px_rgb(28_24_20_/_0.35)]" />
            {count > 0 && <PenLoop className="-ml-2 -mt-5 size-7 text-sm">{count > 9 ? '9+' : count}</PenLoop>}
          </button>
        </DropdownMenuTrigger>
      </div>

      {/* One note, the recuerdos copied onto it. */}
      <DropdownMenuContent align="end" sideOffset={4} className="paper-slip scroll-fade flex max-h-(--radix-dropdown-menu-content-available-height) w-80 -rotate-1 flex-col gap-4 rounded-none bg-transparent px-5 py-4">
        <DropdownMenuLabel className="pen-ink p-0 text-lg">{count ? 'Te dejaron recuerdos' : 'Todavía nada'}</DropdownMenuLabel>
        {count === 0 ? (
          <p className="text-pretty text-sm text-text-weak">Cuando alguien deje un recuerdo en tus animitas, va a llegar acá.</p>
        ) : (
          notifications.map(item => (
            <DropdownMenuItem asChild key={item.id} className="pen-item flex-col items-start gap-0.5 rounded-none p-0 data-[highlighted]:bg-transparent">
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
