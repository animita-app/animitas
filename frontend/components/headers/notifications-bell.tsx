"use client"

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface NotificationData {
  id: string
  title: string
  description?: string
  timeAgo: string
  href: string
}

export function NotificationsBell() {
  const { isEditor, currentUser } = useUser()

  const [revisions, setRevisions] = useState<NotificationData[]>([])
  const [mine, setMine] = useState<NotificationData[]>([])
  const [activeTab, setActiveTab] = useState<"revisions" | "mine">(isEditor ? "revisions" : "mine")

  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()

    const fetchNotifications = async () => {
      // 1. Fetch revisions if editor
      if (isEditor) {
        const { data: sites } = await supabase
          .from('heritage_sites')
          .select('id, title, slug, kind, created_at, status')
          .in('status', ['draft', 'flagged'])
          .order('created_at', { ascending: false })
          .limit(10)

        if (sites) {
          setRevisions(sites.map(s => ({
            id: s.id,
            title: `${s.title} necesita revisión.`,
            description: `Estado: ${s.status}`,
            timeAgo: formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: es }),
            href: `/${s.kind.toLowerCase()}/${s.slug}`
          })))
        }
      }

      // 2. Fetch comments on own sites
      const { data: mySites } = await supabase
        .from('heritage_sites')
        .select('id')
        .eq('creator_id', currentUser.id)

      if (mySites && mySites.length > 0) {
        const mySiteIds = mySites.map(s => s.id)
        const { data: comments } = await supabase
          .from('heritage_site_comments')
          .select('id, content, created_at, user_id, heritage_sites(title, slug, kind), profiles!user_id(full_name)')
          .in('site_id', mySiteIds)
          .neq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (comments) {
          setMine(comments.map((c: any) => ({
            id: c.id,
            title: `${c.profiles?.full_name || 'Alguien'} comentó en ${c.heritage_sites?.title || 'tu sitio'}`,
            description: `«${c.content}»`,
            timeAgo: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es }),
            href: `/${c.heritage_sites?.kind?.toLowerCase() || 'animita'}/${c.heritage_sites?.slug}`
          })))
        }
      }
    }

    fetchNotifications()
  }, [currentUser, isEditor])

  if (!currentUser) return null

  const hasUnread = revisions.length > 0 || mine.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-text-weak">
          <Bell />
          {hasUnread && (
            <span className="absolute top-1 right-1.5 size-2.5 bg-accent rounded-full border-[2px] border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0">
        <DropdownMenuLabel className="sr-only p-3 text-sm font-semibold">
          Notificaciones
        </DropdownMenuLabel>

        {isEditor ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="border-b border-neutral-800 -ml-1 gap-4">
              <TabsTrigger
                value="revisions"
                className="text-white/50 data-[state=active]:text-white data-[state=active]:border-white"
              >
                Revisiones
                <span className="bg-white/25 text-white tabular-nums min-w-4 min-h-4 rounded-full text-xs flex items-center justify-center">
                  {revisions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="mine"
                className="text-white/50 data-[state=active]:text-white data-[state=active]:border-white"
              >
                Mías
                <span className="bg-white/25 text-white tabular-nums min-w-4 min-h-4 rounded-full text-xs flex items-center justify-center">
                  {mine.length}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="revisions" className="m-0 max-h-[350px] overflow-y-auto">
              <DropdownMenuGroup>
                {revisions.length === 0 ? (
                  <div className="p-4 text-sm text-center text-text-weak font-normal">No hay pendientes.</div>
                ) : (
                  revisions.map(item => (
                    <DropdownMenuItem asChild key={item.id} className="cursor-pointer mx-1 my-1 p-2 items-start flex-col gap-1 h-auto">
                      <Link href={item.href} className="flex flex-col w-full">
                        <span className="font-medium line-clamp-2 text-text-strong">{item.title}</span>
                        {item.description && <span className="text-text-weak text-xs line-clamp-1">{item.description}</span>}
                        <span className="text-[10px] text-text-weaker">{item.timeAgo}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>
            </TabsContent>

            <TabsContent value="mine" className="m-0 max-h-[350px] overflow-y-auto">
              <DropdownMenuGroup>
                {mine.length === 0 ? (
                  <div className="p-4 text-sm text-center text-text-weak font-normal">No tienes notificaciones.</div>
                ) : (
                  mine.map(item => (
                    <DropdownMenuItem asChild key={item.id} className="cursor-pointer mx-1 my-1 p-2 items-start flex-col gap-1 h-auto">
                      <Link href={item.href} className="flex flex-col w-full">
                        <span className="font-medium line-clamp-2 text-text-strong">{item.title}</span>
                        {item.description && <span className="text-text-weak text-xs line-clamp-1">{item.description}</span>}
                        <span className="text-[10px] text-text-weaker">{item.timeAgo}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="max-h-[350px] overflow-y-auto w-full py-1">
            <DropdownMenuGroup>
              {mine.length === 0 ? (
                <div className="p-4 text-sm text-center text-text-weak font-normal">No tienes notificaciones.</div>
              ) : (
                mine.map(item => (
                  <DropdownMenuItem asChild key={item.id} className="cursor-pointer mx-1 my-1 p-2 items-start flex-col gap-1 h-auto">
                    <Link href={item.href} className="flex flex-col w-full">
                      <span className="font-medium line-clamp-2 text-text-strong">{item.title}</span>
                      {item.description && <span className="text-text-weak text-xs line-clamp-1">{item.description}</span>}
                      <span className="text-[10px] text-text-weaker">{item.timeAgo}</span>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
