"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSitePermissions } from "@/hooks/use-site-permissions"
import { HeritageSite } from "@/types/heritage"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  INSIGHT_CATEGORY_CONFIG,
  INSIGHT_CATEGORIES,
  INSIGHT_CHIP_BASE,
} from "@/lib/insight-config"

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

// ─── JSONB helpers ────────────────────────────────────────────────────────────

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

// ─── Per-category dropdown ─────────────────────────────────────────────────────

interface CategoryDropdownProps {
  category: string
  siteTags: SiteTag[]
  allTags: InsightTag[]
  onAdd: (tag: InsightTag) => void
  onRemove: (tagId: string) => void
  onCreate: (label: string, category: string) => void
  onClose: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

function CategoryDropdown({
  category,
  siteTags,
  allTags,
  onAdd,
  onRemove,
  onCreate,
  onClose,
  inputRef,
}: CategoryDropdownProps) {
  const [query, setQuery] = useState("")
  const cfg = INSIGHT_CATEGORY_CONFIG[category]

  const selectedIds = new Set(siteTags.filter(t => t.category === category).map(t => t.id))

  const available = useMemo(() => {
    const pool = allTags.filter(t => t.category === category && !selectedIds.has(t.id))
    if (!query.trim()) return pool
    return pool.filter(t => t.label.toLowerCase().includes(query.toLowerCase()))
  }, [allTags, selectedIds, query, category])

  const canCreate = !!query.trim() && !allTags.some(
    t => t.category === category && t.label.toLowerCase() === query.trim().toLowerCase()
  )

  const selected = siteTags.filter(t => t.category === category)

  return (
    <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-md border border-border-weak bg-background shadow-md">
      {/* Selected chips for this category */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 pb-0">
          {selected.map(tag => (
            <span key={tag.id} className={cn(INSIGHT_CHIP_BASE, cfg.chip)}>
              {tag.label}
              <button
                onPointerDown={e => e.preventDefault()}
                onClick={() => onRemove(tag.id)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="p-2">
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'Enter' && canCreate) {
              e.preventDefault()
              onCreate(query.trim(), category)
              setQuery("")
            }
          }}
          placeholder={`Buscar en ${cfg.label.toLowerCase()}...`}
          className="w-full bg-transparent text-sm outline-none placeholder:text-text-weak"
          autoFocus
        />
      </div>

      {/* Available tags */}
      <div className="max-h-44 overflow-y-auto p-1 border-t border-border-weak">
        {available.map(tag => (
          <button
            key={tag.id}
            onPointerDown={e => e.preventDefault()}
            onClick={() => { onAdd(tag); setQuery("") }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-background-weak transition-colors text-left"
          >
            <span className={cn("size-2 rounded-full shrink-0", cfg.dot)} />
            {tag.label}
          </button>
        ))}

        {canCreate && (
          <button
            onPointerDown={e => e.preventDefault()}
            onClick={() => { onCreate(query.trim(), category); setQuery("") }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-background-weak text-text-weak transition-colors text-left"
          >
            <span className={cn("size-2 rounded-full shrink-0 border-2", cfg.dot.replace('bg-', 'border-'))} />
            Crear &quot;{query.trim()}&quot;
          </button>
        )}

        {available.length === 0 && !canCreate && (
          <p className="px-2 py-3 text-sm text-text-weak text-center">Sin resultados</p>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InsightsSection({ site }: InsightsSectionProps) {
  const { canManageInsights } = useSitePermissions(site)
  const [siteTags, setSiteTags] = useState<SiteTag[]>([])
  const [allTags, setAllTags] = useState<InsightTag[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const jsonbChips = useMemo(() => getJsonbChips(site), [site])

  useEffect(() => {
    if (!canManageInsights) { setLoading(false); return }
    const supabase = createClient()
    Promise.all([
      supabase.from('insight_tags').select('*').order('label'),
      supabase.from('heritage_site_insight_tags')
        .select('site_id, tag_id, insight_tags(*)')
        .eq('site_id', site.id),
    ]).then(([tagsRes, siteTagsRes]) => {
      if (tagsRes.data) setAllTags(tagsRes.data)
      if (siteTagsRes.data) {
        setSiteTags(siteTagsRes.data.map((r: any) => ({
          ...r.insight_tags,
          site_id: r.site_id,
          tag_id: r.tag_id,
        })))
      }
      setLoading(false)
    })
  }, [site.id, canManageInsights])

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setActiveCategory(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const addTag = async (tag: InsightTag) => {
    setSiteTags(prev => [...prev, { ...tag, site_id: site.id, tag_id: tag.id }])
    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_insight_tags')
      .insert({ site_id: site.id, tag_id: tag.id })
    if (error) {
      toast.error("Error al agregar insight")
      setSiteTags(prev => prev.filter(t => t.id !== tag.id))
    }
  }

  const removeTag = async (tagId: string) => {
    const removed = siteTags.find(t => t.id === tagId)
    setSiteTags(prev => prev.filter(t => t.id !== tagId))
    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_insight_tags')
      .delete()
      .eq('site_id', site.id)
      .eq('tag_id', tagId)
    if (error) {
      toast.error("Error al quitar insight")
      if (removed) setSiteTags(prev => [...prev, removed])
    }
  }

  const createAndAdd = async (label: string, category: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('insight_tags')
      .insert({ category, label })
      .select()
      .single()
    if (error || !data) { toast.error("Error al crear insight"); return }
    setAllTags(prev => [...prev, data])
    await addTag(data)
  }

  const hasAnything = jsonbChips.length > 0 || siteTags.length > 0 || canManageInsights
  if (!hasAnything) return null
  if (loading) return <div className="h-8 animate-pulse bg-background-weaker rounded-md" />

  return (
    <div className="space-y-3">
      {/* ── JSONB read-only chips ── */}
      {jsonbChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {jsonbChips.map((chip, i) => {
            const cfg = INSIGHT_CATEGORY_CONFIG[chip.category] ?? INSIGHT_CATEGORY_CONFIG.memorial
            return (
              <span key={i} className={cn(INSIGHT_CHIP_BASE, cfg.chip)}>
                {chip.label}
              </span>
            )
          })}
        </div>
      )}

      {/* ── Editor category triggers ── */}
      {canManageInsights && (
        <div ref={containerRef} className="relative">
          <div className="flex gap-2">
            {INSIGHT_CATEGORIES.map(cat => {
              const cfg = INSIGHT_CATEGORY_CONFIG[cat]
              const count = siteTags.filter(t => t.category === cat).length
              const isActive = activeCategory === cat
              const hasItems = count > 0

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs font-medium transition-all",
                    hasItems || isActive
                      ? cfg.trigger
                      : "bg-background-weak text-text-weak hover:text-text"
                  )}
                >
                  <span className={cn(
                    "size-1.5 rounded-full",
                    hasItems || isActive ? cfg.dot : "bg-text-weak"
                  )} />
                  {cfg.label}
                  <span className={cn(
                    "tabular-nums",
                    !hasItems && "opacity-50"
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Per-category dropdown */}
          {activeCategory && (
            <CategoryDropdown
              category={activeCategory}
              siteTags={siteTags}
              allTags={allTags}
              onAdd={addTag}
              onRemove={removeTag}
              onCreate={createAndAdd}
              onClose={() => setActiveCategory(null)}
              inputRef={inputRef}
            />
          )}
        </div>
      )}
    </div>
  )
}
