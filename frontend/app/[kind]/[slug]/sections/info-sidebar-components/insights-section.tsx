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

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface CategoryDropdownProps {
  category: string
  /** JSONB-derived chips for this category */
  jsonbItems: string[]
  /** Junction-table tags for this site */
  siteTags: SiteTag[]
  /** All tags from db for this category */
  allTags: InsightTag[]
  canEdit: boolean
  onToggle: (tag: InsightTag, isSelected: boolean) => void
  onCreate: (label: string, category: string) => void
  onClose: () => void
}

function CategoryDropdown({
  category,
  jsonbItems,
  siteTags,
  allTags,
  canEdit,
  onToggle,
  onCreate,
  onClose,
}: CategoryDropdownProps) {
  const [query, setQuery] = useState("")
  const selectedIds = new Set(siteTags.filter(t => t.category === category).map(t => t.id))

  const visibleTags = useMemo(() => {
    const pool = allTags.filter(t => t.category === category)
    if (!query.trim()) return pool
    return pool.filter(t => t.label.toLowerCase().includes(query.toLowerCase()))
  }, [allTags, query, category])

  const canCreate = canEdit && !!query.trim() && !allTags.some(
    t => t.category === category && t.label.toLowerCase() === query.trim().toLowerCase()
  )

  // Filter jsonb items by query too when editor is searching
  const visibleJsonbItems = query.trim()
    ? jsonbItems.filter(l => l.toLowerCase().includes(query.toLowerCase()))
    : jsonbItems

  const isEmpty = visibleJsonbItems.length === 0 && visibleTags.length === 0 && !canCreate

  return (
    <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-md border border-neutral-800 bg-black text-white shadow-md overflow-hidden">
      {/* Search — editors only */}
      {canEdit && (
        <div className="px-3 py-2 border-b border-neutral-800">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') { e.stopPropagation(); onClose() }
              if (e.key === 'Enter' && canCreate) { e.preventDefault(); onCreate(query.trim(), category); setQuery("") }
            }}
            placeholder="Buscar o crear..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            autoFocus
          />
        </div>
      )}

      <div className="max-h-52 overflow-y-auto p-1">
        {/* JSONB read-only items */}
        {visibleJsonbItems.map((label, i) => (
          <div
            key={`jsonb-${i}`}
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-neutral-400"
          >
            {/* fixed-width slot to align with editor checkmarks */}
            <span className="w-4 shrink-0" />
            {label}
          </div>
        ))}

        {/* Editor-managed tags with checkmarks */}
        {canEdit && visibleTags.map(tag => {
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

        {/* Create new */}
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

        {isEmpty && (
          <p className="px-2 py-3 text-sm text-neutral-500 text-center">Sin información</p>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function InsightsSection({ site }: InsightsSectionProps) {
  const { canManageInsights } = useSitePermissions(site)
  const [siteTags, setSiteTags] = useState<SiteTag[]>([])
  const [allTags, setAllTags] = useState<InsightTag[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(canManageInsights) // only load if editor
  const containerRef = useRef<HTMLDivElement>(null)

  const jsonbChips = useMemo(() => getJsonbChips(site), [site])

  // Editors fetch junction-table tags; non-editors only see JSONB
  useEffect(() => {
    if (!canManageInsights) return
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

  // Close dropdown on outside click
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
    setSiteTags(prev => [...prev, { ...data, site_id: site.id, tag_id: data.id }])
    const supabase2 = createClient()
    await supabase2.from('heritage_site_insight_tags').insert({ site_id: site.id, tag_id: data.id })
  }

  // Don't render if there's truly nothing to show
  const totalJsonb = jsonbChips.length
  const totalTags = siteTags.length
  if (totalJsonb === 0 && totalTags === 0 && !canManageInsights) return null

  if (loading) return <div className="h-8 animate-pulse bg-background-weaker rounded-md" />

  return (
    <div ref={containerRef} className="relative mb-2">
      {/* 3 category triggers — shown for all users */}
      <div className="flex gap-3">
        {INSIGHT_CATEGORIES.map(cat => {
          const cfg = INSIGHT_CATEGORY_CONFIG[cat]
          const jsonbCount = jsonbChips.filter(c => c.category === cat).length
          const tagCount = siteTags.filter(t => t.category === cat).length
          const count = jsonbCount + tagCount
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
                <span className="ml-1 tabular-nums text-sm opacity-60">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Per-category dropdown */}
      {activeCategory && (
        <CategoryDropdown
          category={activeCategory}
          jsonbItems={jsonbChips
            .filter(c => c.category === activeCategory)
            .map(c => c.label)}
          siteTags={siteTags}
          allTags={allTags}
          canEdit={canManageInsights}
          onToggle={toggleTag}
          onCreate={createAndAdd}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  )
}
