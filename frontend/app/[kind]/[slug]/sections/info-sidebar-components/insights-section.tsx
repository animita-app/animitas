"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSitePermissions } from "@/hooks/use-site-permissions"
import { HeritageSite, SiteInsight } from "@/types/heritage"
import { TwoLevelCategory } from "@/components/ui/two-level-combobox"
import { INSIGHT_CATEGORY_CONFIG } from "@/lib/insight-config"
import { InsightChip } from "./insight-chip"
import { useSiteEditing } from "../site-edit-context"
import { useInsightPresets } from "@/hooks/use-insight-presets"

function buildCategories(insightCat: string, presetsByCategory: Record<string, Record<string, string[]>>, activeInsights: SiteInsight[]): TwoLevelCategory[] {
  const activeLabelsForCat = activeInsights.filter(i => i.category === insightCat).map(i => i.label)
  const presetsForInsight = presetsByCategory[insightCat] || {}

  return Object.entries(presetsForInsight).map(([presetCat, presets]) => ({
    key: presetCat,
    label: presetCat,
    items: Array.from(new Set([...presets, ...activeLabelsForCat])).map(label => ({ value: label, label })),
    multiSelect: true,
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
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const siteKind = site.kind?.slug || 'animita'
  const kindId = site.kind_id
  const { presetsByCategory, isLoading: presetsLoading, addPreset, error: presetsError } = useInsightPresets(kindId)

  const availableCategories = ['patrimonial', 'spiritual', 'memorial']

  const getCategoryConfig = (category: string) => {
    return INSIGHT_CATEGORY_CONFIG[category as keyof typeof INSIGHT_CATEGORY_CONFIG] || {
      label: category,
      chip: 'rounded-full inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-gray-200 text-gray-700 border border-gray-300',
      dot: 'bg-gray-300/60',
      trigger: 'rounded-full bg-gray-100 text-gray-700'
    }
  }

  if (presetsError) {
    console.error("[InsightsSection] Presets error:", presetsError)
  }
  console.log("[InsightsSection] Rendering with:", { siteKind, kindId, availableCategories, presetsByCategory })

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('site_insights')
      .select('*')
      .eq('site_id', site.id)
      .then(({ data, error }: any) => {
        if (error) console.error('site_insights error:', error)
        if (data) {
          console.log('Site insights loaded:', data)
          setActiveInsights(data)
        }
        setLoading(false)
      })
  }, [site.id])

  const stageInsights = (insights: SiteInsight[]) => {
    updateStagedChange('insights', {
      insightsList: insights.map(i => ({ category: i.category, label: i.label }))
    })
  }

  const toggleInsight = (insightCategory: string, label: string, isSelected: boolean) => {
    let updatedInsights = activeInsights

    if (isSelected) {
      updatedInsights = activeInsights.filter(t => !(t.label === label && t.category === insightCategory))
    } else {
      const newInsight: SiteInsight = {
        id: crypto.randomUUID(),
        site_id: site.id,
        category: insightCategory,
        label,
      }
      updatedInsights = [...updatedInsights, newInsight]
    }

    setActiveInsights(updatedInsights)

    if (!isEditing) {
      setIsEditing(true)
    }

    stageInsights(updatedInsights)
  }

  const handleCreateItem = async (label: string, presetCategory: string, insightCategory: string) => {
    await addPreset(presetCategory, label, insightCategory)
    toggleInsight(insightCategory, label, false)
  }

  if (loading || presetsLoading) return (
    <div className="flex gap-1.5 mb-6">
      {availableCategories.map(cat => {
        const cfg = getCategoryConfig(cat)
        const count = activeInsights.filter(i => i.category === cat).length
        return (
          <button
            key={cat}
            disabled
            className="inline-flex items-center justify-center rounded-full pl-2.5 pr-1 py-0.5 text-sm font-medium opacity-40 cursor-default bg-secondary text-secondary-foreground"
          >
            {cfg.label}
            <span className="ml-1.5 tabular-nums min-w-4 min-h-4 rounded-full text-xs flex items-center justify-center bg-neutral-300">
              {count}
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
          const cfg = getCategoryConfig(cat)
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
          const cfg = getCategoryConfig(cat)
          const insightsForCat = activeInsights.filter(t => t.category === cat)

          return (
            <InsightChip
              key={cat}
              config={cfg}
              categories={buildCategories(cat, presetsByCategory, activeInsights)}
              selectedValues={insightsForCat.map(i => i.label)}
              onToggle={(label, _sub, isSelected) => toggleInsight(cat, label, isSelected)}
              canCreate={canManageInsights}
              onCreateItem={(label, presetCat) => handleCreateItem(label, presetCat, cat)}
              open={openCategory === cat}
              onOpenChange={(open) => setOpenCategory(open ? cat : null)}
            />
          )
        })}
      </div>
    </div>
  )
}
