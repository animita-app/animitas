"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { X, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSitePermissions } from "@/hooks/use-site-permissions"
import { HeritageSite } from "@/types/heritage"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { INSIGHT_CATEGORY_CONFIG, INSIGHT_CHIP_BASE } from "@/lib/insight-config"

// ─── Types ────────────────────────────────────────────────────────────────────

interface InsightTag {
  id: string
  category: string
  label: string
}

interface SiteTag extends InsightTag {
  site_id: string
  tag_id: string
}

interface InsightsSectionProps {
  site: HeritageSite
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract display chips from the site.insights JSONB */
function getJsonbChips(site: HeritageSite): { label: string; category: string }[] {
  const ins = site.insights
  if (!ins) return []
  const chips: { label: string; category: string }[] = []

  if (ins.memorial?.death_cause)
    chips.push({ label: ins.memorial.death_cause, category: 'memorial' })
  ins.memorial?.social_roles?.forEach((r: string) =>
    chips.push({ label: r, category: 'memorial' })
  )
  ins.spiritual?.rituals_mentioned?.forEach((r: string) =>
    chips.push({ label: r, category: 'spiritual' })
  )
  ins.spiritual?.offerings_mentioned?.forEach((o: string) =>
    chips.push({ label: o, category: 'spiritual' })
  )
  if (ins.patrimonial?.size)
    chips.push({ label: ins.patrimonial.size, category: 'patrimonial' })
  if (ins.patrimonial?.form)
    chips.push({ label: ins.patrimonial.form, category: 'patrimonial' })

  return chips
}

// ─── Component ───────────────────────────────────────────────────────────────

export function InsightsSection({ site }: InsightsSectionProps) {
  const { canManageInsights } = useSitePermissions(site)

  // Junction-table tags (editor-managed)
  const [siteTags, setSiteTags] = useState<SiteTag[]>([])
  const [allTags, setAllTags] = useState<InsightTag[]>([])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // JSONB chips (always shown)
  const jsonbChips = useMemo(() => getJsonbChips(site), [site])

  useEffect(() => {
    if (!canManageInsights) { setLoading(false); return }
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
  }, [site.id, canManageInsights])

  // Close combobox on outside pointer
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const siteTagIds = useMemo(() => new Set(siteTags.map((t) => t.id)), [siteTags])

  const availableTags = useMemo(() => {
    const filtered = allTags.filter((t) => !siteTagIds.has(t.id))
    return query
      ? filtered.filter((t) => t.label.toLowerCase().includes(query.toLowerCase()))
      : filtered
  }, [allTags, siteTagIds, query])

  const groupedAvailable = useMemo(() => {
    const groups: Record<string, InsightTag[]> = {}
    availableTags.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    })
    return groups
  }, [availableTags])

  const canCreateNew = !!query.trim() && !allTags.some(
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

  const createAndAdd = async (category: string = 'memorial') => {
    const label = query.trim()
    if (!label) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('insight_tags')
      .insert({ category, label })
      .select()
      .single()
    if (error || !data) { toast.error("Error al crear insight"); return }
    setAllTags((prev) => [...prev, data])
    await addTag(data)
  }

  // Nothing to show at all
  if (jsonbChips.length === 0 && !canManageInsights) return null
  if (loading) return <div className="h-10 animate-pulse bg-background-weaker rounded-md" />

  return (
    <div ref={containerRef} className="relative -mx-2">
      {/* Single inline flex row: JSONB readonly chips + editor chips + input */}
      <div
        className="flex flex-wrap gap-1.5 min-h-8 rounded-md px-2 py-1.5 cursor-text"
        onClick={() => { if (canManageInsights) { setOpen(true); inputRef.current?.focus() } }}
      >
        {/* JSONB insight chips (read-only, always shown) */}
        {jsonbChips.map((chip, i) => {
          const cfg = INSIGHT_CATEGORY_CONFIG[chip.category] ?? INSIGHT_CATEGORY_CONFIG.memorial
          return (
            <span key={`jsonb-${i}`} className={cn(INSIGHT_CHIP_BASE, cfg.chip)}>
              {chip.label}
            </span>
          )
        })}

        {/* Editor-managed junction-table chips (removable) */}
        {canManageInsights && siteTags.map((tag) => {
          const cfg = INSIGHT_CATEGORY_CONFIG[tag.category] ?? INSIGHT_CATEGORY_CONFIG.memorial
          return (
            <span key={tag.id} className={cn(INSIGHT_CHIP_BASE, cfg.chip)}>
              {tag.label}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); removeTag(tag.id) }}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </span>
          )
        })}

        {/* Combobox input (editor only) */}
        {canManageInsights && (
          <>
            <Plus className="size-4 text-text-weak shrink-0 self-center" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
                if (e.key === 'Backspace' && !query && siteTags.length > 0)
                  removeTag(siteTags[siteTags.length - 1].id)
              }}
              placeholder="Añadir insights"
              className="flex-1 min-w-24 bg-transparent outline-none placeholder:text-text-weak h-8"
            />
          </>
        )}
      </div>

      {/* Dropdown */}
      {open && canManageInsights && (
        <div className="absolute top-full inset-x-4 mt-1 z-50 rounded-md border border-border-weak bg-background shadow-md">
          <div className="max-h-56 overflow-y-auto p-1">

            {/* Existing tags grouped by category */}
            {Object.entries(groupedAvailable).map(([cat, tags]) => (
              <div key={cat}>
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-weak">
                  {INSIGHT_CATEGORY_CONFIG[cat]?.label ?? cat}
                </p>
                {tags.map((tag) => {
                  const cfg = INSIGHT_CATEGORY_CONFIG[tag.category] ?? INSIGHT_CATEGORY_CONFIG.memorial
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

            {/* Create new: show category picker */}
            {canCreateNew && (
              <div>
                {availableTags.length > 0 && <div className="mx-2 my-1 h-px bg-border-weak" />}
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-weak">
                  Crear &quot;{query.trim()}&quot; como...
                </p>
                {Object.entries(INSIGHT_CATEGORY_CONFIG).map(([cat, cfg]) => (
                  <button
                    key={cat}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => { createAndAdd(cat); setOpen(false) }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-background-weak transition-colors text-left"
                  >
                    <span className={cn("size-2 rounded-full shrink-0", cfg.dot)} />
                    {cfg.label}
                  </button>
                ))}
              </div>
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
