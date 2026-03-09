"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { X, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSitePermissions } from "@/hooks/use-site-permissions"
import { HeritageSite } from "@/types/heritage"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface InsightTag {
  id: string
  category: string
  label: string
}

interface SiteTag extends InsightTag {
  site_id: string
  tag_id: string
}

const CATEGORY_CONFIG: Record<string, { label: string; dot: string; chip: string }> = {
  memorial:    { label: 'Memorial',    dot: 'bg-rose-400',    chip: 'bg-rose-50 text-rose-700 border-rose-200' },
  spiritual:   { label: 'Espiritual',  dot: 'bg-violet-400',  chip: 'bg-violet-50 text-violet-700 border-violet-200' },
  patrimonial: { label: 'Patrimonial', dot: 'bg-amber-400',   chip: 'bg-amber-50 text-amber-700 border-amber-200' },
}

interface DetailedInfoSectionProps {
  site: HeritageSite
}

export function DetailedInfoSection({ site }: DetailedInfoSectionProps) {
  const { canManageInsights } = useSitePermissions(site)
  const [siteTags, setSiteTags] = useState<SiteTag[]>([])
  const [allTags, setAllTags] = useState<InsightTag[]>([])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [tagsRes, siteTagsRes] = await Promise.all([
        supabase.from('insight_tags').select('*').order('category').order('label'),
        supabase.from('heritage_site_insight_tags')
          .select('site_id, tag_id, insight_tags(*)')
          .eq('site_id', site.id),
      ])
      if (tagsRes.data) setAllTags(tagsRes.data)
      if (siteTagsRes.data) {
        setSiteTags(siteTagsRes.data.map((r: any) => ({
          ...r.insight_tags,
          site_id: r.site_id,
          tag_id: r.tag_id,
        })))
      }
      setLoading(false)
    }
    load()
  }, [site.id])

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const siteTagIds = useMemo(() => new Set(siteTags.map((t) => t.id)), [siteTags])

  const availableTags = useMemo(() => {
    const filtered = allTags.filter((t) => !siteTagIds.has(t.id))
    if (!query) return filtered
    return filtered.filter((t) => t.label.toLowerCase().includes(query.toLowerCase()))
  }, [allTags, siteTagIds, query])

  const groupedAvailable = useMemo(() => {
    const groups: Record<string, InsightTag[]> = {}
    availableTags.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    })
    return groups
  }, [availableTags])

  const canCreateNew = query.trim() && !allTags.some(
    (t) => t.label.toLowerCase() === query.trim().toLowerCase()
  )

  const addTag = async (tag: InsightTag) => {
    setSiteTags((prev) => [...prev, { ...tag, site_id: site.id, tag_id: tag.id }])
    setQuery("")
    inputRef.current?.focus()
    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_insight_tags')
      .insert({ site_id: site.id, tag_id: tag.id })
    if (error) {
      toast.error("Error al agregar insight")
      setSiteTags((prev) => prev.filter((t) => t.id !== tag.id))
    }
  }

  const removeTag = async (tagId: string) => {
    const removed = siteTags.find((t) => t.id === tagId)
    setSiteTags((prev) => prev.filter((t) => t.id !== tagId))
    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_insight_tags')
      .delete()
      .eq('site_id', site.id)
      .eq('tag_id', tagId)
    if (error) {
      toast.error("Error al quitar insight")
      if (removed) setSiteTags((prev) => [...prev, removed])
    }
  }

  const createAndAdd = async () => {
    const label = query.trim()
    if (!label) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('insight_tags')
      .insert({ category: 'memorial', label })
      .select()
      .single()
    if (error || !data) { toast.error("Error al crear insight"); return }
    setAllTags((prev) => [...prev, data])
    await addTag(data)
  }

  if (loading) return <Skeleton className="h-16" />
  if (siteTags.length === 0 && !canManageInsights) return null

  // Read-only: just chips
  if (!canManageInsights) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {siteTags.map((tag) => {
          const cfg = CATEGORY_CONFIG[tag.category] ?? CATEGORY_CONFIG.memorial
          return (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1 px-2 h-6 rounded-full border text-xs font-normal ${cfg.chip}`}
            >
              {tag.label}
            </span>
          )
        })}
      </div>
    )
  }

  // Editable: chips + combobox input
  return (
    <div ref={containerRef} className="relative">
      {/* Chips + input row */}
      <div
        className="flex flex-wrap gap-1.5 min-h-8 rounded-md px-2 py-1.5 cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        {siteTags.map((tag) => {
          const cfg = CATEGORY_CONFIG[tag.category] ?? CATEGORY_CONFIG.memorial
          return (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1 px-2 h-6 rounded-full border text-xs font-normal ${cfg.chip}`}
            >
              {tag.label}
              <button
                onPointerDown={(e) => { e.stopPropagation() }}
                onClick={(e) => { e.stopPropagation(); removeTag(tag.id) }}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </span>
          )
        })}

        {siteTags.length === 0 && !query && (
          <Plus className="size-3.5 text-text-weak shrink-0 self-center" />
        )}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canCreateNew) { e.preventDefault(); createAndAdd() }
            if (e.key === 'Escape') setOpen(false)
            if (e.key === 'Backspace' && !query && siteTags.length > 0) {
              removeTag(siteTags[siteTags.length - 1].id)
            }
          }}
          placeholder={siteTags.length === 0 ? "Añadir insights" : ""}
          className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-text-weak py-0.5"
        />
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-border-weak bg-background shadow-md">
          <div className="max-h-52 overflow-y-auto p-1">
            {Object.entries(groupedAvailable).map(([cat, tags]) => (
              <div key={cat}>
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-weak">
                  {CATEGORY_CONFIG[cat]?.label ?? cat}
                </p>
                {tags.map((tag) => {
                  const cfg = CATEGORY_CONFIG[tag.category] ?? CATEGORY_CONFIG.memorial
                  return (
                    <button
                      key={tag.id}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => { addTag(tag); setOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-background-weak transition-colors text-left"
                    >
                      <span className={cn("size-2 rounded-full shrink-0", cfg.dot)} />
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            ))}

            {canCreateNew && (
              <Button
                onPointerDown={(e) => e.preventDefault()}
                onClick={createAndAdd}
                size="sm"
                variant="ghost"
              >
                <Plus />
                Crear &quot;{query.trim()}&quot;
              </Button>
            )}

            {availableTags.length === 0 && !canCreateNew && (
              <p className="px-2 py-3 text-sm text-text-weak font-normal text-center">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
