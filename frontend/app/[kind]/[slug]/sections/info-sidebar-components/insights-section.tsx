"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Check, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSitePermissions } from "@/hooks/use-site-permissions"
import { HeritageSite } from "@/types/heritage"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"
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
  if (ins.memorial?.narrator_relation) chips.push({ label: ins.memorial.narrator_relation, category: 'memorial' })
  ins.memorial?.social_roles?.forEach((r: string) => chips.push({ label: r, category: 'memorial' }))

  ins.spiritual?.rituals_mentioned?.forEach((r: string) => chips.push({ label: r, category: 'spiritual' }))
  ins.spiritual?.offerings_mentioned?.forEach((o: string) => chips.push({ label: o, category: 'spiritual' }))
  if (ins.spiritual?.digital_visit_count) chips.push({ label: `Visitas digitales: ${ins.spiritual.digital_visit_count}`, category: 'spiritual' })

  if (ins.patrimonial?.size) chips.push({ label: ins.patrimonial.size, category: 'patrimonial' })
  if (ins.patrimonial?.form) chips.push({ label: ins.patrimonial.form, category: 'patrimonial' })
  if (ins.patrimonial?.antiquity_year) chips.push({ label: `Año: ${ins.patrimonial.antiquity_year}`, category: 'patrimonial' })

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

function CategoryDropdownContent({
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
    <>
      <ComboboxInput
        showTrigger={false}
        placeholder="Buscar..."
        autoFocus
        value={query}
        onChange={(e: any) => setQuery(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter' && canCreate) {
            e.preventDefault();
            onCreate(query.trim(), category);
            setQuery("")
          }
        }}
      />

      {/* JSONB read-only items are rendered directly */}
      {visibleJsonbItems.length > 0 && (
        <div className="px-2 pb-1">
          {visibleJsonbItems.map((label, i) => (
            <div
              key={`jsonb-${i}`}
              className="flex items-center gap-2 rounded-sm py-1.5 text-sm text-muted-foreground select-none"
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* ComboboxList maps across selected options natively */}
      <ComboboxList>
        {(item: any) => (
          <ComboboxItem key={item.id} value={item}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxList>

      {canCreate && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onCreate(query.trim(), category)
            setQuery("")
          }}
          className="w-full relative flex items-center px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white outline-none rounded-sm transition-colors mt-1"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear &quot;{query.trim()}&quot;
        </button>
      )}

      {isEmpty && (
        <div className="px-2 py-3 text-sm text-neutral-400 !font-normal text-center">
          Sin resultados
        </div>
      )}
    </>
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

  if (loading) return <Skeleton className="h-8" />

  return (
    <div className="relative mb-6">
      <div className="flex gap-1.5">
        {INSIGHT_CATEGORIES.map(cat => {
          const cfg = INSIGHT_CATEGORY_CONFIG[cat]
          const jsonbCount = jsonbChips.filter(c => c.category === cat).length
          const tagCount = siteTags.filter(t => t.category === cat).length
          const count = jsonbCount + tagCount
          const isActive = activeCategory === cat

          const allTagsForCat = allTags.filter(t => t.category === cat)
          const selectedTagIdsForCat = siteTags.filter(t => t.category === cat).map(t => t.id)

          return (
            <Combobox
              key={cat}
              items={allTagsForCat}
              value={allTagsForCat.filter(t => selectedTagIdsForCat.includes(t.id))}
              onValueChange={(newSelection: any[]) => {
                const newIds = newSelection.map(s => s.id)
                const added = newIds.find(id => !selectedTagIdsForCat.includes(id))
                const removed = selectedTagIdsForCat.find(id => !newIds.includes(id))
                if (added) {
                  const tag = allTagsForCat.find(t => t.id === added)
                  if (tag) toggleTag(tag, false)
                } else if (removed) {
                  const tag = allTagsForCat.find(t => t.id === removed)
                  if (tag) toggleTag(tag, true)
                }
              }}
              multiple
              open={isActive}
              onOpenChange={(open) => setActiveCategory(open ? cat : null)}
            >
              <ComboboxTrigger render={
                <button
                  className={cn(
                    "inline-flex items-center justify-center rounded-full pl-2.5 pr-1 py-0.5 text-sm font-medium transition-colors cursor-pointer outline-none",
                    count > 0
                      ? cfg.trigger
                      : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  )}
                >
                  {cfg.label}
                  <span
                    className={cn(
                      "ml-1.5 tabular-nums min-w-4 min-h-4 rounded-full text-xs flex items-center justify-center",
                      count > 0
                        ? cfg.dot
                        : "bg-neutral-300"
                    )}
                  >
                    {count || "0"}
                  </span>
                </button>
              } />
              <ComboboxContent align="start" className="w-48 max-h-52 overflow-y-auto">
                <CategoryDropdownContent
                  category={cat}
                  jsonbItems={jsonbChips
                    .filter(c => c.category === cat)
                    .map(c => c.label)}
                  siteTags={siteTags}
                  allTags={allTagsForCat}
                  canEdit={canManageInsights}
                  onToggle={toggleTag}
                  onCreate={createAndAdd}
                  onClose={() => setActiveCategory(null)}
                />
              </ComboboxContent>
            </Combobox>
          )
        })}
      </div>
    </div>
  )
}
