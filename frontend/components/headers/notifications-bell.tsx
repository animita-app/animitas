"use client"

import Image from "next/image"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            {/* An old letter, like the ones left at an animita: someone left a recuerdo on yours. */}
            <Button variant="ghost" size="icon-lg" className="relative" aria-label="Notificaciones">
              <Image src="/cutouts/envelope.png" alt="" width={240} height={138} draggable={false} className="h-6 w-auto -rotate-6 drop-shadow-[0_2px_2px_rgb(28_24_20_/_0.35)]" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1 size-3 rounded-full bg-destructive shadow-[0_1px_1px_rgb(28_24_20_/_0.4)]" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Notificaciones</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" sideOffset={4} className="w-72 p-1">
        <DropdownMenuLabel className="sr-only">Notificaciones</DropdownMenuLabel>
        <DropdownMenuGroup className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-center text-text-weak">Cuando alguien comente tus animitas, lo vas a ver acá.</p>
          ) : (
            notifications.map(item => (
              <DropdownMenuItem asChild key={item.id} className="items-start flex-col gap-1 p-2">
                <Link href={item.href}>
                  <span className="font-medium text-text-strong text-pretty">{item.title}</span>
                  <span className="text-text-weak text-pretty">{item.description}</span>
                  <span className="text-xs text-text-weaker">{item.timeAgo}</span>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
