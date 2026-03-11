"use client"

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Link2, CheckCircle2, Pencil, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
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
import { useMobileScrollThreshold } from '@/hooks/use-mobile'
import { useSitePriority } from '@/hooks/use-site-priority'
import { PRIORITY_CONFIG } from '@/lib/site-priority'

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
  const { isEditing, setIsEditing, requestCancel, requestConfirm, stagedChanges, clearStagedChanges, confirmToken, cancelToken } = useSiteEditing()

  const isCreator = currentUser?.id === site.creator_id
  const canSeeVersions = isEditor || isCreator
  const isOverThreshold = useMobileScrollThreshold()

  const { priority } = useSitePriority(site.id)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [selectedRevision, setSelectedRevision] = useState<string>('current')
  const [hasCopied, setHasCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchRevisions = () => {
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
  }

  useEffect(() => {
    fetchRevisions()
  }, [site.id, canSeeVersions])

  useEffect(() => {
    if (confirmToken > 0 && Object.keys(stagedChanges).length > 0 && currentUser?.id) {
      const saveVersion = async () => {
        setIsSaving(true)
        setSaveSuccess(false)
        const supabase = createClient()

        try {
          const updateData = { ...stagedChanges }
          const insightsData = updateData.insights as any
          delete updateData.insights

          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('heritage_sites')
              .update({ ...updateData, updated_at: new Date().toISOString() })
              .eq('id', site.id)

            if (updateError) throw updateError
          }

          if (insightsData?.insightsList) {
            await supabase
              .from('site_insights')
              .delete()
              .eq('site_id', site.id)

            const insightsToInsert = insightsData.insightsList.map((i: any) => ({
              site_id: site.id,
              category: i.category,
              subcategory: i.subcategory,
              label: i.label
            }))

            const { error: insightError } = await supabase
              .from('site_insights')
              .insert(insightsToInsert)

            if (insightError) throw insightError
          }

          const changedFields = Object.keys(stagedChanges).filter(k => k !== 'insights')
          const diffSummary = changedFields.length === 0 && insightsData?.insightsList
            ? 'Insights actualizados'
            : changedFields.length === 1
            ? `${changedFields[0]} actualizado`
            : `Actualizado: ${changedFields.join(', ')}`

          await supabase.from('heritage_site_revisions').insert({
            site_id: site.id,
            author_id: currentUser?.id,
            diff_summary: diffSummary,
            snapshot: stagedChanges
          })

          setSaveSuccess(true)
          setIsSaving(false)
          setIsEditing(false)
          clearStagedChanges()
          fetchRevisions()

          setTimeout(() => {
            setSaveSuccess(false)
            setSelectedRevision('current')
          }, 3000)
        } catch (err: any) {
          console.error('[GalleryHeader] Save error:', err)
          toast.error("Error al guardar versión", { id: "saving-version" })
          setIsSaving(false)
        }
      }

      saveVersion()
    }
  }, [confirmToken, site.id, currentUser?.id])

  useEffect(() => {
    if (cancelToken > 0) {
      clearStagedChanges()
      setSelectedRevision('current')
    }
  }, [cancelToken])

  const prevIsEditing = useRef(false)
  useEffect(() => {
    if (prevIsEditing.current && !isEditing) {
      fetchRevisions()
      setSelectedRevision('current')
    }
    prevIsEditing.current = isEditing
  }, [isEditing])

  const currentVersionLabel = revisions.length > 0
    ? `v1.${revisions.length}`
    : 'v1.0'
  const nextVersionLabel = `v1.${revisions.length + 1}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleCancel = () => {
    clearStagedChanges()
    setIsEditing(false)
    requestCancel()
  }

  return (
    <div className={cn(
      "md:bg-background-weak border-b fixed md:absolute h-14 inset-x-0 top-0 z-40 flex items-center justify-between px-3 py-3 pointer-events-none transition-all duration-300",
      isOverThreshold ? "bg-white/90 backdrop-blur-md border-border" : "border-transparent bg-transparent"
    )}>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "pointer-events-auto z-10 gap-1 h-8 transition-all duration-300 !pl-1.5",
          isOverThreshold
            ? "bg-neutral-200/50 hover:bg-neutral-200 text-black md:bg-neutral-200"
            : "bg-black/40 backdrop-blur-sm hover:bg-black/50 text-white md:bg-neutral-200 md:hover:bg-neutral-300 md:backdrop-blur-none md:text-text",
          "[&_svg]:!opacity-50"
        )}
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
              isEditing || Object.keys(stagedChanges).length > 0 ? "opacity-0 invisible absolute" : "visible relative"
            )}
          >
            {!saveSuccess && (
              <Select
                value={selectedRevision}
                onValueChange={setSelectedRevision}
              >
                <SelectTrigger className={cn(
                  "min-w-fit cursor-pointer md:hover:!bg-neutral-200 md:mix-blend-normal border-transparent !shadow-none md:!text-black bg-transparent !h-10 text-sm px-3 gap-3 transition-colors duration-300",
                  isOverThreshold
                    ? "!text-black [&_svg]:!text-black mix-blend-normal"
                    : "text-white mix-blend-difference"
                )}>
                  <SelectValue placeholder={currentVersionLabel} />
                </SelectTrigger>
                <SelectContent className="[&_svg]:!text-white [&_svg]:!opacity-100">
                  <SelectItem value="current">
                    <div className="inline-flex items-center gap-1.5">
                      <span>{currentVersionLabel}</span>
                    </div>
                  </SelectItem>
                  {[...revisions].reverse().map((rev) => (
                    <SelectItem key={rev.id} value={rev.id}>
                      <div className="font-normal inline-flex items-center gap-2.5">
                        <span>{rev.version_label}</span>
                        <span className="text-text">
                          por {rev.author_name}
                          {" • "}
                          {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isEditor && priority !== 'ok' && (
              <Badge
                variant="outline"
                className={cn("hidden md:flex h-6", PRIORITY_CONFIG[priority].className)}
              >
                {PRIORITY_CONFIG[priority].label}
              </Badge>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-4 justify-center pointer-events-auto transition-all duration-150",
              isEditing || Object.keys(stagedChanges).length > 0 || saveSuccess ? "opacity-100 visible relative animate-in fade-in-0" : "opacity-0 invisible absolute"
            )}
          >
            {saveSuccess ? (
              <div className="flex items-center gap-2 bg-success text-white rounded-md px-3 py-1 h-10">
                <CheckCircle2 className="size-4 shrink-0" />
                <span className="text-sm font-medium">Versión guardada</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-background bg-black text-white rounded-md pl-3 pr-1 py-1 h-10">
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" />
                    <span className="pr-3 pl-1 text-sm font-normal whitespace-nowrap">
                      Guardando <span className="font-semibold">{nextVersionLabel}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="pr-3 pl-1 text-sm font-normal whitespace-nowrap">
                      Creando <span className="font-semibold">{nextVersionLabel}</span>
                    </span>
                    <Button size="sm" onClick={requestConfirm} className="w-8 md:w-fit h-8 shadow-none" disabled={isSaving}>
                      <Check className="md:hidden" />
                      <span className="hidden md:block">Cancelar</span>
                    </Button>
                    <Button size="icon" className="w-8 bg-neutral-800/70 hover:bg-neutral-800 text-white h-full shadow-none" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                      <X />
                      <span className="sr-only">Cancelar</span>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center z-10 gap-1.5 pointer-events-auto">
        {(isEditor || isCreator) && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 transition-all duration-300",
              isOverThreshold
                ? "bg-neutral-200/50 hover:bg-neutral-200 text-black md:bg-neutral-200"
                : "bg-black/40 backdrop-blur-sm hover:bg-black/50 text-white md:bg-neutral-200 md:hover:bg-neutral-300 md:backdrop-blur-none md:text-text"
            )}
            onClick={onEditGallery}
          >
            <Pencil />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 transition-all duration-300",
            isOverThreshold
              ? "bg-neutral-200/50 hover:bg-neutral-200 text-black md:bg-neutral-200"
              : "bg-black/40 backdrop-blur-sm hover:bg-black/50 text-white md:bg-neutral-200 md:hover:bg-neutral-300 md:backdrop-blur-none md:text-text"
          )}
          onClick={handleCopyLink}
        >
          {hasCopied ? <CheckCircle2 /> : <Link2 />}
        </Button>
      </div>
    </div>
  )
}
