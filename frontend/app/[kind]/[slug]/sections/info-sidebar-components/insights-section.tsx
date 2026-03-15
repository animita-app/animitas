"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSitePermissions } from "@/hooks/use-site-permissions"
import { HeritageSite, SiteInsight } from "@/types/heritage"
import { toast } from "sonner"
import { TwoLevelCategory } from "@/components/ui/two-level-combobox"
import { INSIGHT_CATEGORY_CONFIG, INSIGHT_CATEGORIES } from "@/lib/insight-config"
import { InsightChip } from "./insight-chip"
import { useSiteEditing } from "../site-edit-context"
import { getAvailableInsightCategories } from "@/lib/insight-config"

type SubcategoryConfig = { insight_category: string; subcategory: string; multi_select: boolean; sort_order: number }
type InsightItem = { category: string; subcategory: string; label: string }

function buildCategories(insightCat: string, items: InsightItem[], config: SubcategoryConfig[], activeInsights: SiteInsight[]): TwoLevelCategory[] {
  // Combine items from global taxonomy and active insights for this site
  const combinedItems: InsightItem[] = [
    ...items,
    ...activeInsights.map(i => ({ category: i.category, subcategory: i.subcategory || "General", label: i.label }))
  ]

  // Unique items by label+category+subcategory
  const uniqueItemsMap = new Map<string, InsightItem>()
  combinedItems.forEach(item => {
    const key = `${item.category}/${item.subcategory || 'General'}/${item.label}`
    if (!uniqueItemsMap.has(key)) uniqueItemsMap.set(key, item)
  })
  const itemsToUse = Array.from(uniqueItemsMap.values())

  const subcats = Array.from(new Set([
    ...itemsToUse.filter(t => t.category === insightCat).map(t => t.subcategory || "General"),
    ...config.filter(c => c.insight_category === insightCat).map(c => c.subcategory)
  ]))

  if (subcats.length === 0) {
    subcats.push("General")
  }

  return subcats
    .sort((a, b) => {
      const aOrder = config.find(c => c.subcategory === a)?.sort_order ?? 99
      const bOrder = config.find(c => c.subcategory === b)?.sort_order ?? 99
      return aOrder - bOrder
    })
    .map(sub => ({
      key: sub,
      label: sub,
      items: itemsToUse
        .filter(t => t.category === insightCat && (t.subcategory || "General") === sub)
        .map(t => ({ value: t.label, label: t.label })),
      multiSelect: config.find(c => c.subcategory === sub)?.multi_select ?? false,
    }))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface InsightsSectionProps {
  site: HeritageSite
}

export function InsightsSection({ site }: InsightsSectionProps) {
  const { canManageInsights } = useSitePermissions(site)
  const { isEditing, setIsEditing, updateStagedChange } = useSiteEditing()
  const [activeInsights, setActiveInsights] = useState<SiteInsight[]>([])
  const [insightItems, setInsightItems] = useState<InsightItem[]>([])
  const [subConfig, setSubConfig] = useState<SubcategoryConfig[]>([])
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const siteKind = (site as any).kind || 'animita'
  const availableCategories = getAvailableInsightCategories(siteKind)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('site_insights').select('*').eq('site_id', site.id),
      supabase.from('insight_subcategory_config').select('insight_category, subcategory, multi_select, sort_order'),
    ]).then(([insights, config]) => {
      if (insights.error) console.error('site_insights error:', insights.error)
      if (config.error) console.error('insight_subcategory_config error:', config.error)

      if (insights.data) {
        console.log('Site insights loaded:', insights.data)
        setActiveInsights(insights.data)
      }
      if (config.data) {
        console.log('insight_subcategory_config loaded:', config.data.length, 'configs')
        setSubConfig(config.data)
      }
      setLoading(false)
    }).catch(err => {
      console.error('Insights fetch error:', err)
      setLoading(false)
    })
  }, [site.id])

  const stageInsights = (insights: SiteInsight[]) => {
    updateStagedChange('insights', {
      insightsList: insights.map(i => ({ category: i.category, subcategory: i.subcategory, label: i.label }))
    })
  }

  const toggleInsight = (insightCategory: string, label: string, subcategory: string, isSelected: boolean) => {
    const isSingle = subConfig.find(
      c => c.insight_category === insightCategory && c.subcategory === subcategory
    )?.multi_select === false

    let updatedInsights = activeInsights

    if (isSelected) {
      updatedInsights = activeInsights.filter(t => !(t.label === label && t.category === insightCategory))
    } else {
      const displaced = isSingle
        ? activeInsights.filter(t => t.category === insightCategory && t.subcategory === subcategory)
        : []

      if (displaced.length > 0) {
        updatedInsights = activeInsights.filter(t => !(t.category === insightCategory && t.subcategory === subcategory))
      }

      const newInsight: SiteInsight = {
        id: crypto.randomUUID(),
        site_id: site.id,
        category: insightCategory,
        subcategory,
        label,
      }
      updatedInsights = [...updatedInsights, newInsight]
    }

    const hasChanged = JSON.stringify(updatedInsights.sort((a, b) => a.label.localeCompare(b.label))) !==
      JSON.stringify(activeInsights.sort((a, b) => a.label.localeCompare(b.label)))

    setActiveInsights(updatedInsights)

    if (!isEditing) {
      setIsEditing(true)
    }

    if (hasChanged) {
      stageInsights(updatedInsights)
    }
  }

  if (loading) return (
    <div className="flex gap-1.5 mb-6">
      {availableCategories.map(cat => {
        const cfg = INSIGHT_CATEGORY_CONFIG[cat]
        return (
          <button
            key={cat}
            disabled
            className="inline-flex items-center justify-center rounded-full pl-2.5 pr-1 py-0.5 text-sm font-medium opacity-40 cursor-default bg-secondary text-secondary-foreground"
          >
            {cfg.label}
            <span className="ml-1.5 tabular-nums min-w-4 min-h-4 rounded-full text-xs flex items-center justify-center bg-neutral-300">
              0
            </span>
          </button>
        )
      })}
    </div>
  )

  if (activeInsights.length === 0 && !canManageInsights) return null

  if (!canManageInsights) {
    return (
      <div className="flex flex-wrap gap-1.5 mb-6">
        {availableCategories.map(cat => {
          const cfg = INSIGHT_CATEGORY_CONFIG[cat]
          return activeInsights
            .filter(i => i.category === cat)
            .map(insight => (
              <span key={insight.id} className={cfg.chip}>
                {insight.label}
              </span>
            ))
        })}
      </div>
    )
  }

  return (
    <div className="relative mb-6">
      <div className="flex gap-1.5">
        {availableCategories.map(cat => {
          const cfg = INSIGHT_CATEGORY_CONFIG[cat]
          const insightsForCat = activeInsights.filter(t => t.category === cat)

          return (
            <InsightChip
              key={cat}
              config={cfg}
              categories={buildCategories(cat, insightItems, subConfig.filter(c => c.insight_category === cat), activeInsights)}
              selectedValues={insightsForCat.map(i => i.label)}
              onToggle={(label, sub, isSelected) => toggleInsight(cat, label, sub, isSelected)}
              canCreate={canManageInsights}
              onCreateItem={(label, sub) => toggleInsight(cat, label, sub, false)}
              open={openCategory === cat}
              onOpenChange={(open) => setOpenCategory(open ? cat : null)}
            />
          )
        })}
      </div>
    </div>
  )
}
