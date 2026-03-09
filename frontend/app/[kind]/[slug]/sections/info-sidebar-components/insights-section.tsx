"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Check, Plus } from "lucide-react"
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
  if (ins.memorial?.death_cause) chips.push({ label: ins.memorial.death_cause, category: 'memorial' })
  ins.memorial?.social_roles?.forEach((r: string) => chips.push({ label: r, category: 'memorial' }))
  ins.spiritual?.rituals_mentioned?.forEach((r: string) => chips.push({ label: r, category: 'spiritual' }))
  ins.spiritual?.offerings_mentioned?.forEach((o: string) => chips.push({ label: o, category: 'spiritual' }))
  if (ins.patrimonial?.size) chips.push({ label: ins.patrimonial.size, category: 'patrimonial' })
  if (ins.patrimonial?.form) chips.push({ label: ins.patrimonial.form, category: 'patrimonial' })
  return chips
}

// ─── Per-category dropdown ────────────────────────────────────────────────────

interface CategoryDropdownProps {
  category: string
  siteTags: SiteTag[]
  allTags: InsightTag[]
  onToggle: (tag: InsightTag, isSelected: boolean) => void
  onCreate: (label: string, category: string) => void
  onClose: () => void
}

function CategoryDropdown({ category, siteTags, allTags, onToggle, onCreate, onClose }: CategoryDropdownProps) {
  const [query, setQuery] = useState("")
  const cfg = INSIGHT_CATEGORY_CONFIG[category]
  const selectedIds = new Set(siteTags.filter(t => t.category === category).map(t => t.id))

  const visible = useMemo(() => {
    const pool = allTags.filter(t => t.category === category)
    if (!query.trim()) return pool
    return pool.filter(t => t.label.toLowerCase().includes(query.toLowerCase()))
  }, [allTags, query, category])

  const canCreate = !!query.trim() && !allTags.some(
    t => t.category === category && t.label.toLowerCase() === query.trim().toLowerCase()
  )

  return (
    <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-md border border-neutral-800 bg-black text-white shadow-md overflow-hidden">
      {/* Search input */}
      <div className="px-3 py-2 border-b border-neutral-800">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') { e.stopPropagation(); onClose() }
            if (e.key === 'Enter' && canCreate) { e.preventDefault(); onCreate(query.trim(), category); setQuery("") }
          }}
          placeholder={`Buscar en ${cfg.label.toLowerCase()}...`}
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500 text-white"
          autoFocus
        />
      </div>

      {/* Tag list — checkmarks for selected */}
      <div className="max-h-48 overflow-y-auto p-1">
        {visible.map(tag => {
          const isSelected = selectedIds.has(tag.id)
          return (
            <button
              key={tag.id}
              onPointerDown={e => e.preventDefault()}
              onClick={() => onToggle(tag, isSelected)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-neutral-800 transition-colors text-left"
            >
              <span className="w-4 shrink-0 flex items-center justify-center">
                {isSelected && <Check className="size-3.5" />}
              </span>
              {tag.label}
            </button>
          )
        })}

        {canCreate && (
          <button
            onPointerDown={e => e.preventDefault()}
            onClick={() => { onCreate(query.trim(), category); setQuery("") }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-neutral-800 text-neutral-400 transition-colors text-left"
          >
            <span className="w-4 shrink-0 flex items-center justify-center">
              <Plus className="size-3.5" />
            </span>
            Crear &quot;{query.trim()}&quot;
          </button>
        )}

        {visible.length === 0 && !canCreate && (
          <p className="px-2 py-3 text-sm text-neutral-500 text-center">Sin resultados</p>
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

  const toggleTag = async (tag: InsightTag, isSelected: boolean) => {
    if (isSelected) {
      // Remove
      const removed = siteTags.find(t => t.id === tag.id)
      setSiteTags(prev => prev.filter(t => t.id !== tag.id))
      const supabase = createClient()
      const { error } = await supabase
        .from('heritage_site_insight_tags')
        .delete()
        .eq('site_id', site.id)
        .eq('tag_id', tag.id)
      if (error) {
        toast.error("Error al quitar insight")
        if (removed) setSiteTags(prev => [...prev, removed])
      }
    } else {
      // Add
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
    // auto-add (not selected yet)
    setSiteTags(prev => [...prev, { ...data, site_id: site.id, tag_id: data.id }])
    const supabase2 = createClient()
    await supabase2.from('heritage_site_insight_tags').insert({ site_id: site.id, tag_id: data.id })
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
          <div className="flex gap-3">
            {INSIGHT_CATEGORIES.map(cat => {
              const cfg = INSIGHT_CATEGORY_CONFIG[cat]
              const count = siteTags.filter(t => t.category === cat).length
              const isActive = activeCategory === cat

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className={cn(
                    "text-sm transition-colors",
                    isActive
                      ? "text-text-strong font-medium"
                      : count > 0
                        ? "text-text"
                        : "text-text-weak hover:text-text"
                  )}
                >
                  {cfg.label}
                  {count > 0 && (
                    <span className="ml-1 tabular-nums text-xs">{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {activeCategory && (
            <CategoryDropdown
              category={activeCategory}
              siteTags={siteTags}
              allTags={allTags}
              onToggle={toggleTag}
              onCreate={createAndAdd}
              onClose={() => setActiveCategory(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
