"use client"

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  type: 'comment' | 'route' | 'revision-needed' | 'revision-approved'
  title: string
  description?: string
  timeAgo: string
  isRead?: boolean
}

function NotificationItem({ type, title, description, timeAgo, isRead }: NotificationItemProps) {
  return (
    <div className={cn(
      "flex flex-col gap-1 p-3 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md cursor-pointer",
      !isRead && "bg-neutral-50 dark:bg-neutral-800/50"
    )}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn(
          "font-medium line-clamp-2",
          !isRead && "text-text-strong",
          isRead && "text-text-weak"
        )}>
          {title}
        </span>
        {!isRead && (
          <span className="shrink-0 size-2 rounded-full bg-accent mt-1" />
        )}
      </div>
      {description && (
        <span className="text-text-weak line-clamp-1">{description}</span>
      )}
      <span className="text-xs text-text-weaker">{timeAgo}</span>
    </div>
  )
}

export function NotificationsBell() {
  const { isEditor } = useUser()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-text-weak hover:text-text-strong">
          <Bell className="size-5" />
          {/* Example unread dot */}
          <span className="absolute top-2 right-2 size-2 rounded-full bg-accent outline outline-2 outline-background" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="font-semibold text-text-strong">Notificaciones</h4>
        </div>

        {isEditor ? (
          <Tabs defaultValue="revisions" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border-weak bg-transparent p-0 h-auto">
              <TabsTrigger
                value="revisions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-4 py-2 font-medium"
              >
                Revisiones
              </TabsTrigger>
              <TabsTrigger
                value="mine"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-4 py-2 font-medium"
              >
                Mis publicaciones
              </TabsTrigger>
            </TabsList>
            <TabsContent value="revisions" className="m-0 p-2 max-h-[400px] overflow-y-auto">
              <NotificationItem
                type="revision-needed"
                title="Animita de Evaristo Montt necesita una revisión urgente."
                timeAgo="hace 2 horas"
              />
              <NotificationItem
                type="revision-needed"
                title="Santuario de los Pescadores ha recibido 15 nuevos aportes."
                isRead
                timeAgo="hace 1 día"
              />
            </TabsContent>
            <TabsContent value="mine" className="m-0 p-2 max-h-[400px] overflow-y-auto">
              <NotificationItem
                type="comment"
                title="Juan comentó en tu animación 'La Llorona'"
                description="«¡Qué buena historia!»"
                timeAgo="hace 5 min"
              />
              <NotificationItem
                type="route"
                title="María añadió tu sitio a su ruta 'Mitos de Santiago'"
                isRead
                timeAgo="hace 3 horas"
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-2 max-h-[400px] overflow-y-auto">
            <NotificationItem
              type="comment"
              title="Juan comentó en tu animación 'La Llorona'"
              description="«¡Qué buena historia!»"
              timeAgo="hace 5 min"
            />
            <NotificationItem
              type="route"
              title="María añadió tu sitio a su ruta 'Mitos de Santiago'"
              isRead
              timeAgo="hace 3 horas"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
