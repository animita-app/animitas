"use client"

import { useEffect, useState } from 'react'
import { ChevronLeft, Link2, CheckCircle2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/user-context'
import { useSiteEditing } from './site-edit-context'
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
  onEditGallery?: () => void
}

export function GalleryHeader({ site, onEditGallery }: GalleryHeaderProps) {
  const { currentUser, isEditor } = useUser()
  const { isEditing, requestCancel, requestConfirm } = useSiteEditing()
  const isCreator = currentUser?.id === site.creator_id
  const canSeeVersions = isEditor || isCreator

  const [revisions, setRevisions] = useState<Revision[]>([])
  const [selectedRevision, setSelectedRevision] = useState<string>('current')
  const [hasCopied, setHasCopied] = useState(false)

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
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  return (
    <div className="md:bg-background-weak md:border-b fixed md:absolute h-14 inset-x-0 top-0 z-40 *:z-10 flex items-center justify-between px-3 py-3 pointer-events-none">
      <Button
        size="sm"
        variant="ghost"
        className="pointer-events-auto gap-1 bg-black/40 backdrop-blur-sm hover:bg-black/50 md:bg-neutral-200 md:hover:bg-neutral-300 md:backdrop-blur-none h-8 text-white md:text-text [&_svg]:!opacity-50 !pl-1.5"
        asChild
      >
        <Link href="/">
          <ChevronLeft />
          Volver
        </Link>
      </Button>

      {canSeeVersions && (
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "flex items-center h-8 gap-2 justify-center pointer-events-auto transition-all duration-300",
              isEditing ? "opacity-0 invisible absolute" : "opacity-100 visible relative"
            )}
          >
            <Select
              value={selectedRevision}
              onValueChange={setSelectedRevision}
            >
              <SelectTrigger className="w-32 bg-background !h-10 text-sm gap-3 px-3">
                <SelectValue placeholder={currentVersionLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  <div className="inline-flex items-center gap-2.5">
                    <span>{currentVersionLabel}</span>
                    {/* <span>
                      {revisions[revisions.length - 1]?.author_name || site.created_by?.display_name || site.created_by?.name || "Anónimo"}
                      {" • "}
                      {formatDistanceToNow(new Date(revisions[revisions.length - 1]?.created_at || site.created_at), { addSuffix: true, locale: es })}
                    </span> */}
                  </div>
                </SelectItem>
                {[...revisions].reverse().map((rev) => (
                  <SelectItem key={rev.id} value={rev.id}>
                    <div className="inline-flex items-center gap-2.5">
                      <span>{currentVersionLabel}</span>
                      <span>
                        {revisions[revisions.length - 1]?.author_name || site.created_by?.display_name || site.created_by?.name || "Anónimo"}
                        {" • "}
                        {formatDistanceToNow(new Date(revisions[revisions.length - 1]?.created_at || site.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isEditor && (
              <Badge variant="secondary" className="hidden md:flex h-6">
                Publicado
              </Badge>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-4 justify-center pointer-events-auto transition-all duration-300",
              !isEditing ? "opacity-0 invisible absolute" : "opacity-100 visible relative animate-in fade-in-0 slide-in-from-bottom-2"
            )}
          >
            <div className="flex items-center gap-1 bg-background bg-black text-white rounded-md pl-3 pr-1 py-1 h-10">
              <span className="pr-4 pl-1 text-sm font-normal whitespace-nowrap">
                Creando <span className="font-semibold">{nextVersionLabel}</span>
              </span>
              <Button size="sm" onClick={requestConfirm} className="h-8 shadow-none">
                Confirmar
              </Button>
              <Button size="sm" className="bg-neutral-800/70 hover:bg-neutral-800 text-white h-full shadow-none" variant="ghost" onClick={requestCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 pointer-events-auto">
        {(isEditor || isCreator) && !isEditing && (
          <Button
            size="icon"
            variant="ghost"
            className="bg-black/40 backdrop-blur-sm hover:bg-black/50 md:bg-neutral-200 md:hover:bg-neutral-300 md:backdrop-blur-none h-8 text-white md:text-text w-8"
            onClick={onEditGallery}
          >
            <Pencil />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="bg-black/40 backdrop-blur-sm hover:bg-black/50 md:bg-neutral-200 md:hover:bg-neutral-300 md:backdrop-blur-none h-8 text-white md:text-text w-8"
          onClick={handleCopyLink}
        >
          {hasCopied ? <CheckCircle2 /> : <Link2 />}
        </Button>
      </div>
    </div>
  )
}
