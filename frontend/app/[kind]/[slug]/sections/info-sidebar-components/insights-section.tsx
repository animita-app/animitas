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

// ─── Data ─────────────────────────────────────────────────────────────────────

const FALLBACK_TAGS: { category: string; subcategory: string; label: string }[] = [
  // Memorial
  { category: 'memorial', subcategory: 'Causa de muerte', label: 'Homicidios y Violencia' },
  { category: 'memorial', subcategory: 'Causa de muerte', label: 'Suicidio' },
  { category: 'memorial', subcategory: 'Causa de muerte', label: 'Natural' },
  { category: 'memorial', subcategory: 'Causa de muerte', label: 'Accidente vehicular' },
  { category: 'memorial', subcategory: 'Causa de muerte', label: 'Desconocida o Misteriosa' },

  { category: 'memorial', subcategory: 'Rol social', label: 'Obrero / Trabajador' },
  { category: 'memorial', subcategory: 'Rol social', label: 'Militar / Uniformado' },
  { category: 'memorial', subcategory: 'Rol social', label: 'Estudiante / Joven' },
  { category: 'memorial', subcategory: 'Rol social', label: 'Dirigente / Líder social' },
  { category: 'memorial', subcategory: 'Rol social', label: 'Deportista / Figura pública' },

  { category: 'memorial', subcategory: 'Vinculación', label: 'Vecino del sector' },
  { category: 'memorial', subcategory: 'Vinculación', label: 'Familiar directo' },
  { category: 'memorial', subcategory: 'Vinculación', label: 'Investigador' },
  { category: 'memorial', subcategory: 'Vinculación', label: 'Conocido' },
  { category: 'memorial', subcategory: 'Vinculación', label: 'Admirador' },

  { category: 'memorial', subcategory: 'Contexto histórico', label: 'Dictadura Militar' },
  { category: 'memorial', subcategory: 'Contexto histórico', label: 'Estallido Social' },
  { category: 'memorial', subcategory: 'Contexto histórico', label: 'Colonia' },
  { category: 'memorial', subcategory: 'Contexto histórico', label: 'Independencia' },
  { category: 'memorial', subcategory: 'Contexto histórico', label: 'Actualidad' },

  { category: 'memorial', subcategory: 'Rango de edad', label: 'Infancia (0-12)' },
  { category: 'memorial', subcategory: 'Rango de edad', label: 'Adolescencia (13-17)' },
  { category: 'memorial', subcategory: 'Rango de edad', label: 'Adulto Joven (18-29)' },
  { category: 'memorial', subcategory: 'Rango de edad', label: 'Adulto (30-59)' },
  { category: 'memorial', subcategory: 'Rango de edad', label: 'Adulto Mayor (60+)' },

  // Spiritual
  { category: 'spiritual', subcategory: 'Rituales', label: 'Prender Velas' },
  { category: 'spiritual', subcategory: 'Rituales', label: 'Rezos y Oraciones' },
  { category: 'spiritual', subcategory: 'Rituales', label: 'Peregrinación / Procesión' },
  { category: 'spiritual', subcategory: 'Rituales', label: 'Cumplimiento de Mandas' },
  { category: 'spiritual', subcategory: 'Rituales', label: 'Coronación de Cruz' },

  { category: 'spiritual', subcategory: 'Ofrendas', label: 'Juguetes y Peluches' },
  { category: 'spiritual', subcategory: 'Ofrendas', label: 'Placas de Agradecimiento' },
  { category: 'spiritual', subcategory: 'Ofrendas', label: 'Monedas / Dinero' },
  { category: 'spiritual', subcategory: 'Ofrendas', label: 'Cigarrillos / Alcohol' },
  { category: 'spiritual', subcategory: 'Ofrendas', label: 'Fotos y Recuerdos' },

  { category: 'spiritual', subcategory: 'Creencias', label: 'Popular' },
  { category: 'spiritual', subcategory: 'Creencias', label: 'Católica' },
  { category: 'spiritual', subcategory: 'Creencias', label: 'Evangélica' },
  { category: 'spiritual', subcategory: 'Creencias', label: 'Animismo' },
  { category: 'spiritual', subcategory: 'Creencias', label: 'Sincretismo' },

  { category: 'spiritual', subcategory: 'Manifestaciones', label: 'Milagros' },
  { category: 'spiritual', subcategory: 'Manifestaciones', label: 'Apariciones' },
  { category: 'spiritual', subcategory: 'Manifestaciones', label: 'Sueños' },
  { category: 'spiritual', subcategory: 'Manifestaciones', label: 'Señales' },
  { category: 'spiritual', subcategory: 'Manifestaciones', label: 'Sanaciones' },

  { category: 'spiritual', subcategory: 'Espacios sagrados', label: 'Altar principal' },
  { category: 'spiritual', subcategory: 'Espacios sagrados', label: 'Gruta lateral' },
  { category: 'spiritual', subcategory: 'Espacios sagrados', label: 'Nicho' },
  { category: 'spiritual', subcategory: 'Espacios sagrados', label: 'Exterior' },
  { category: 'spiritual', subcategory: 'Espacios sagrados', label: 'Memorial' },

  // Patrimonial
  { category: 'patrimonial', subcategory: 'Tipología', label: 'Muro Conmemorativo' },
  { category: 'patrimonial', subcategory: 'Tipología', label: 'Gruta o Cueva' },
  { category: 'patrimonial', subcategory: 'Tipología', label: 'Capilla o Templete' },
  { category: 'patrimonial', subcategory: 'Tipología', label: 'Tumba Devocional' },
  { category: 'patrimonial', subcategory: 'Tipología', label: 'Cenotafio' },

  { category: 'patrimonial', subcategory: 'Escala', label: 'Monumental' },
  { category: 'patrimonial', subcategory: 'Escala', label: 'Pequeña / Íntima' },
  { category: 'patrimonial', subcategory: 'Escala', label: 'Mediana' },
  { category: 'patrimonial', subcategory: 'Escala', label: 'Grande' },
  { category: 'patrimonial', subcategory: 'Escala', label: 'Efímera' },

  { category: 'patrimonial', subcategory: 'Materialidad', label: 'Ladrillo' },
  { category: 'patrimonial', subcategory: 'Materialidad', label: 'Cemento' },
  { category: 'patrimonial', subcategory: 'Materialidad', label: 'Piedra' },
  { category: 'patrimonial', subcategory: 'Materialidad', label: 'Madera' },
  { category: 'patrimonial', subcategory: 'Materialidad', label: 'Metal' },

  { category: 'patrimonial', subcategory: 'Estado de conservación', label: 'Excelente' },
  { category: 'patrimonial', subcategory: 'Estado de conservación', label: 'Bueno' },
  { category: 'patrimonial', subcategory: 'Estado de conservación', label: 'Regular' },
  { category: 'patrimonial', subcategory: 'Estado de conservación', label: 'Deteriorado' },
  { category: 'patrimonial', subcategory: 'Estado de conservación', label: 'En ruinas' },

  { category: 'patrimonial', subcategory: 'Época', label: 'Siglo XIX' },
  { category: 'patrimonial', subcategory: 'Época', label: '1900-1930' },
  { category: 'patrimonial', subcategory: 'Época', label: '1940-1960' },
  { category: 'patrimonial', subcategory: 'Época', label: '1970-1990' },
  { category: 'patrimonial', subcategory: 'Época', label: 'Siglo XXI' },
]

type SubcategoryConfig = { insight_category: string; subcategory: string; multi_select: boolean; sort_order: number }

function buildCategories(insightCat: string, config: SubcategoryConfig[]): TwoLevelCategory[] {
  const subcats = Array.from(new Set(
    FALLBACK_TAGS.filter(t => t.category === insightCat).map(t => t.subcategory || "General")
  ))

  return subcats
    .sort((a, b) => {
      const aOrder = config.find(c => c.subcategory === a)?.sort_order ?? 99
      const bOrder = config.find(c => c.subcategory === b)?.sort_order ?? 99
      return aOrder - bOrder
    })
    .map(sub => ({
      key: sub,
      label: sub,
      items: FALLBACK_TAGS
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
      if (insights.data) setActiveInsights(insights.data)
      if (config.data) setSubConfig(config.data)
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
              categories={buildCategories(cat, subConfig.filter(c => c.insight_category === cat))}
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
