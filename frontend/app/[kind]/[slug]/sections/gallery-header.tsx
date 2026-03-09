"use client"

import { useEffect, useState } from 'react'
import { ChevronLeft, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidingPanels } from '@/components/ui/sliding-panels'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/user-context'
import { useSiteEditing } from './site-edit-context'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Revision {
  id: string
  diff_summary: string
  created_at: string
  author_name: string
  version_label: string
}

interface GalleryHeaderProps {
  site: any
}

const VERSION_WIDTH = 260
const EDITING_WIDTH = 320

export function GalleryHeader({ site }: GalleryHeaderProps) {
  const { currentUser, isEditor } = useUser()
  const { isEditing, requestCancel, requestConfirm } = useSiteEditing()
  const isCreator = currentUser?.id === site.creator_id
  const canSeeVersions = isEditor || isCreator

  const [revisions, setRevisions] = useState<Revision[]>([])
  const [selectedRevision, setSelectedRevision] = useState<string>('current')

  useEffect(() => {
    if (!canSeeVersions) return
    const supabase = createClient()
    supabase
      .from('heritage_site_revisions')
      .select('id, diff_summary, created_at, user_profiles!author_id(display_name)')
      .eq('site_id', site.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!data) return
        const mapped = data.map((r: any, i: number) => ({
          id: r.id,
          diff_summary: r.diff_summary || 'Edición sin descripción',
          created_at: r.created_at,
          author_name: r.user_profiles?.display_name || 'Anónimo',
          version_label: `v1.${i + 1}`,
        }))
        setRevisions(mapped)
      })
  }, [site.id, canSeeVersions])

  const currentVersionLabel = revisions.length > 0
    ? `v1.${revisions.length}`
    : 'v1.0'
  const nextVersionLabel = `v1.${revisions.length + 1}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copiado')
  }

  return (
    <div className="absolute h-14 inset-x-0 top-0 *:z-[99] flex items-center justify-between px-3 py-3 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none">
      <Button
        size="sm"
        variant="ghost"
        className="pointer-events-auto !gap-1 text-text-weak md:bg-neutral-dark-6 md:hover:bg-neutral-dark-5 md:text-white md:hover:text-white border-0 h-8 [&_svg]:opacity-50 !pl-1.5"
        asChild
      >
        <Link href="/">
          <ChevronLeft />
          Volver
        </Link>
      </Button>

      {canSeeVersions && (
        <SlidingPanels
          activeIndex={isEditing ? 1 : 0}
          widths={[VERSION_WIDTH, EDITING_WIDTH]}
          className="rounded-none"
        >
          <div className="flex items-center gap-2 justify-center pointer-events-auto">
            <Select
              value={selectedRevision}
              onValueChange={setSelectedRevision}
            >
              <SelectTrigger className="w-32 bg-background !h-8">
                <SelectValue placeholder={currentVersionLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  {currentVersionLabel}
                </SelectItem>
                {[...revisions].reverse().map((rev) => (
                  <SelectItem key={rev.id} value={rev.id}>
                    <div className="text-sm flex flex-col gap-0.5 py-0.5">
                      <span className="font-medium !text-text-strong">{rev.version_label}</span>
                      <span className="text-text-weak">
                        por {rev.author_name} · {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isEditor && (
              <Badge variant="secondary">
                Publicado
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 justify-center pl-2 pointer-events-auto">
            <div className="flex items-center gap-2 bg-black rounded-full px-3 py-1.5">
              <span className="text-white text-xs whitespace-nowrap">
                Creando <span className="font-semibold">{nextVersionLabel}</span>
              </span>
              <div className="w-px h-3 bg-white/25 shrink-0" />
              <button
                onClick={requestConfirm}
                className="text-white text-xs font-medium hover:text-white/80 transition-colors whitespace-nowrap"
              >
                Confirmar
              </button>
              <button
                onClick={requestCancel}
                className="text-white/60 text-xs hover:text-white/80 transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>
          </div>
        </SlidingPanels>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="pointer-events-auto !gap-1 text-text-weak md:bg-neutral-dark-6 md:hover:bg-neutral-dark-5 md:text-white md:hover:text-white border-0 w-8 h-8"
        onClick={handleCopyLink}
      >
        <Link2 />
      </Button>
    </div>
  )
}
