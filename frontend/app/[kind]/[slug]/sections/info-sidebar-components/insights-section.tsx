"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Check, Plus, ChevronRight, ChevronLeft, Search } from "lucide-react"
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
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"
import {
  INSIGHT_CATEGORY_CONFIG,
  INSIGHT_CATEGORIES,
} from "@/lib/insight-config"

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_TAGS: any[] = [
  // Memorial: Causa de muerte
  { id: 'f1', category: 'memorial', subcategory: 'Causa de muerte', label: 'Homicidios y Violencia' },
  { id: 'f2', category: 'memorial', subcategory: 'Causa de muerte', label: 'Suicidio' },
  { id: 'f3', category: 'memorial', subcategory: 'Causa de muerte', label: 'Natural' },
  { id: 'f4', category: 'memorial', subcategory: 'Causa de muerte', label: 'Accidente vehicular' },
  { id: 'f5', category: 'memorial', subcategory: 'Causa de muerte', label: 'Desconocida o Misteriosa' },

  // Memorial: Rol social
  { id: 'f6', category: 'memorial', subcategory: 'Rol social', label: 'Obrero / Trabajador' },
  { id: 'f7', category: 'memorial', subcategory: 'Rol social', label: 'Militar / Uniformado' },
  { id: 'f8', category: 'memorial', subcategory: 'Rol social', label: 'Estudiante / Joven' },
  { id: 'f9', category: 'memorial', subcategory: 'Rol social', label: 'Dirigente / Líder social' },
  { id: 'f10', category: 'memorial', subcategory: 'Rol social', label: 'Deportista / Figura pública' },

  // Spiritual: Rituales
  { id: 'f11', category: 'spiritual', subcategory: 'Rituales', label: 'Prender Velas' },
  { id: 'f12', category: 'spiritual', subcategory: 'Rituales', label: 'Rezos y Oraciones' },
  { id: 'f13', category: 'spiritual', subcategory: 'Rituales', label: 'Peregrinación / Procesión' },
  { id: 'f14', category: 'spiritual', subcategory: 'Rituales', label: 'Cumplimiento de Mandas' },
  { id: 'f15', category: 'spiritual', subcategory: 'Rituales', label: 'Coronación de Cruz' },

  // Spiritual: Ofrendas
  { id: 'f16', category: 'spiritual', subcategory: 'Ofrendas', label: 'Juguetes y Peluches' },
  { id: 'f17', category: 'spiritual', subcategory: 'Ofrendas', label: 'Placas de Agradecimiento' },
  { id: 'f18', category: 'spiritual', subcategory: 'Ofrendas', label: 'Monedas / Dinero' },
  { id: 'f19', category: 'spiritual', subcategory: 'Ofrendas', label: 'Cigarrillos / Alcohol' },
  { id: 'f20', category: 'spiritual', subcategory: 'Ofrendas', label: 'Fotos y Recuerdos' },

  // Patrimonial: Tipología
  { id: 'f21', category: 'patrimonial', subcategory: 'Tipología', label: 'Muro Conmemorativo' },
  { id: 'f22', category: 'patrimonial', subcategory: 'Tipología', label: 'Gruta o Cueva' },
  { id: 'f23', category: 'patrimonial', subcategory: 'Tipología', label: 'Capilla o Templete' },
  { id: 'f24', category: 'patrimonial', subcategory: 'Tipología', label: 'Tumba Devocional' },
  { id: 'f25', category: 'patrimonial', subcategory: 'Tipología', label: 'Cenotafio' },

  // Patrimonial: Escala
  { id: 'f26', category: 'patrimonial', subcategory: 'Escala', label: 'Monumental' },
  { id: 'f27', category: 'patrimonial', subcategory: 'Escala', label: 'Pequeña / Íntima' },
  { id: 'f28', category: 'patrimonial', subcategory: 'Escala', label: 'Mediana' },
  { id: 'f29', category: 'patrimonial', subcategory: 'Escala', label: 'Grande' },
]

const IS_MULTI_SELECT: Record<string, boolean> = {
  "rol social": true,
  "rituales": true,
  "ofrendas": true,
  "social_roles": true,
  "rituals_mentioned": true,
  "offerings_mentioned": true,
  "General": true,
}

const isMultiSelect = (subcategory: string) => IS_MULTI_SELECT[subcategory] ?? false
const isMultiSelectCaseInsensitive = (subcategory: string) => {
  const s = subcategory.toLowerCase()
  if (s.includes("rol") || s.includes("ritual") || s.includes("ofrenda") || s.includes("mencionado")) return true
  return IS_MULTI_SELECT[subcategory] ?? false
}

interface SiteInsight {
  id: string
  site_id: string
  category: string
  subcategory: string
  label: string
}

interface InsightsSectionProps {
  site: HeritageSite
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface CategoryDropdownProps {
  category: string
  /** Current rows from site_insights for this category */
  activeInsights: SiteInsight[]
  canEdit: boolean
  activeSubcategory: string | null
  onSubcategoryChange: (sub: string | null) => void
  onToggle: (label: string, subcategory: string, isSelected: boolean) => void
  onClose: () => void
}

function CategoryDropdownContent({
  category,
  activeInsights,
  canEdit,
  activeSubcategory,
  onSubcategoryChange,
  onToggle,
  onClose,
}: CategoryDropdownProps) {
  const [query, setQuery] = useState("")
  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  const selectedLabels = new Set(activeInsights.map(t => t.label))

  const subcategories = useMemo(() => {
    const list = FALLBACK_TAGS.filter(t => t.category === category).map(t => t.subcategory || "General")
    return Array.from(new Set(list)).sort()
  }, [category])

  const visibleSubcategories = useMemo(() => {
    if (activeSubcategory) return []
    if (!query.trim()) return subcategories
    return subcategories.filter(s => s.toLowerCase().includes(query.toLowerCase()))
  }, [subcategories, query, activeSubcategory])

  const visibleTags = useMemo(() => {
    let pool = FALLBACK_TAGS.filter(t => t.category === category)
    if (activeSubcategory && !query.trim()) {
      pool = pool.filter(t => (t.subcategory || "General") === activeSubcategory)
    }
    if (!query.trim()) {
      return activeSubcategory ? pool.map(p => ({ label: p.label, subcategory: p.subcategory || "General" })) : []
    }
    return pool
      .map(p => ({ label: p.label, subcategory: p.subcategory || "General" }))
      .filter(t => t.label.toLowerCase().includes(query.toLowerCase()))
  }, [query, category, activeSubcategory])

  const canCreate = canEdit && !!query.trim() && !visibleTags.some(
    t => t.label.toLowerCase() === query.trim().toLowerCase()
  )

  const isEmpty = visibleSubcategories.length === 0 && visibleTags.length === 0 && !canCreate

  const showSubcategoriesList = !activeSubcategory

  return (
    <div className="flex flex-col overflow-hidden w-full relative bg-neutral-900/50 backdrop-blur-md rounded-md">
      <ComboboxInput
        showTrigger={false}
        placeholder="Buscar..."
        autoFocus
        value={query}
        onChange={(e: any) => setQuery(e.target.value)}
        onKeyDown={(e: any) => {
          if (activeSubcategory && (e.key === 'Escape' || (e.key === 'ArrowLeft' && !query))) {
            e.preventDefault();
            e.stopPropagation();
            onSubcategoryChange(null);
            return;
          }
          if (e.key === 'Enter' && canCreate) {
            e.preventDefault();
            onToggle(query.trim(), activeSubcategory || "General", false);
            setQuery("")
          }
        }}
        customLeftSection={
          activeSubcategory ? (
            <button
              onClick={() => onSubcategoryChange(null)}
              className="group size-6 flex items-center justify-center transition-all hover:bg-white/10 rounded-full cursor-pointer"
            >
              <ChevronLeft className="size-4 text-white/25 group-hover:text-white transition-colors" />
            </button>
          ) : (
            <div className="size-6 flex items-center justify-center">
              <Search className="size-4 text-white/25" />
            </div>
          )
        }
        className="border-b border-white/5"
      />

      <div className="relative overflow-hidden">
        {/* Step 1: Subcategories */}
        {showSubcategoriesList && visibleSubcategories.length > 0 && (
          <ComboboxList className={cn(
            "p-1 flex flex-col gap-0.5",
            !isFirstRender.current && "animate-in fade-in slide-in-from-left-4"
          )}>
            {visibleSubcategories.map(sub => {
              const selectedInSub = activeInsights.filter(t => (t.subcategory || "General") === sub)
              const multi = isMultiSelectCaseInsensitive(sub)

              return (
                <ComboboxItem
                  key={sub}
                  value={sub}
                  className="group flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none data-highlighted:bg-white/10 transition-colors pr-2"
                  onSelect={() => {
                    onSubcategoryChange(sub)
                    setQuery("")
                  }}
                >
                  <div className="flex flex-col items-start gap-0.5 overflow-hidden pr-2">
                    <span className="text-white font-medium truncate w-full text-left">{sub}</span>
                    {!multi && selectedInSub.length > 0 && (
                      <span className="text-white/40 text-[10px] font-normal leading-tight truncate w-full text-left italic">
                        {selectedInSub[0].label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedInSub.length > 0 && (
                      multi ? (
                        <span className="bg-white/20 text-white tabular-nums min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center">
                          {selectedInSub.length}
                        </span>
                      ) : (
                        <Check className="size-3.5 text-blue-400" />
                      )
                    )}
                    <ChevronRight className="size-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                </ComboboxItem>
              )
            })}
          </ComboboxList>
        )}

        {/* Step 2: Tags & JSONB */}
        {activeSubcategory && (
          <div className={cn(
            "w-full flex flex-col",
            !isFirstRender.current && "animate-in fade-in slide-in-from-right-4"
          )}>
            {visibleTags.length > 0 && (
              <ComboboxList className="p-1 flex flex-col gap-0.5">
                {visibleTags.map(({ label, subcategory }) => {
                  const isSelected = selectedLabels.has(label)
                  return (
                    <ComboboxItem
                      key={label}
                      value={label}
                      className="group flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none data-highlighted:bg-white/10 transition-colors pr-2"
                      onSelect={() => onToggle(label, subcategory, isSelected)}
                    >
                      <span className={cn(
                        "text-white transition-colors",
                        isSelected ? "font-semibold text-blue-400" : "font-normal"
                      )}>
                        {label}
                      </span>
                      {isSelected && <Check className="size-3.5 text-blue-400 shrink-0" />}
                    </ComboboxItem>
                  )
                })}
              </ComboboxList>
            )}

            {canCreate && (
              <div className="p-1 px-1 border-t border-white/5 mt-1">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onToggle(query.trim(), activeSubcategory || "General", false)
                    setQuery("")
                  }}
                  className="w-full relative flex items-center px-2 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white rounded-sm outline-none transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear &quot;{query.trim()}&quot;
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Results (When query is present but no active subcategory) */}
        {!activeSubcategory && query.trim() && visibleTags.length > 0 && (
          <div className={cn(
            "w-full flex flex-col p-1 animate-in fade-in zoom-in-95",
          )}>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5 mb-1 pb-1">
              Etiquetas coincidentes
            </div>
            <ComboboxList className="flex flex-col gap-0.5">
              {visibleTags.map(({ label, subcategory }) => {
                const isSelected = selectedLabels.has(label)
                return (
                  <ComboboxItem
                    key={`${subcategory}-${label}`}
                    value={label}
                    className="group flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none data-highlighted:bg-white/10 transition-colors pr-2"
                    onSelect={() => onToggle(label, subcategory, isSelected)}
                  >
                    <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                      <span className={cn(
                        "text-white transition-colors",
                        isSelected ? "font-semibold text-blue-400" : "font-normal"
                      )}>
                        {label}
                      </span>
                      <span className="text-[10px] font-normal text-white/30 uppercase tracking-tighter">
                        {subcategory}
                      </span>
                    </div>
                    {isSelected && <Check className="size-3.5 text-blue-400 shrink-0" />}
                  </ComboboxItem>
                )
              })}
            </ComboboxList>
          </div>
        )}

        {isEmpty && (
          <div className="px-2 py-6 text-sm text-white/30 !font-normal text-center">
            {query.trim() ? "No se encontraron resultados" : "Selecciona una categoría"}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function InsightsSection({ site }: InsightsSectionProps) {
  const { canManageInsights } = useSitePermissions(site)
  const [activeInsights, setActiveInsights] = useState<SiteInsight[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(canManageInsights)
  const containerRef = useRef<HTMLDivElement>(null)


  // Editors fetch Junction data
  useEffect(() => {
    if (!canManageInsights) return
    const supabase = createClient()
    supabase.from('site_insights')
      .select('*')
      .eq('site_id', site.id)
      .then(({ data }) => {
        if (data) setActiveInsights(data)
        setLoading(false)
      })
  }, [site.id, canManageInsights])



  const toggleInsight = async (label: string, subcategory: string, isSelected: boolean) => {
    if (isSelected) {
      const removed = activeInsights.find(t => t.label === label && t.category === activeCategory)
      setActiveInsights(prev => prev.filter(t => !(t.label === label && t.category === activeCategory)))
      const supabase = createClient()
      const { error } = await supabase
        .from('site_insights')
        .delete()
        .eq('site_id', site.id)
        .eq('category', activeCategory!)
        .eq('subcategory', subcategory)
        .eq('label', label)
      if (error) {
        toast.error("Error al quitar insight")
        if (removed) setActiveInsights(prev => [...prev, removed])
      }
    } else {
      const newInsight = {
        id: crypto.randomUUID(),
        site_id: site.id,
        category: activeCategory!,
        subcategory,
        label
      }
      setActiveInsights(prev => [...prev, newInsight])
      const supabase = createClient()
      const { error } = await supabase
        .from('site_insights')
        .insert({
          site_id: site.id,
          category: activeCategory!,
          subcategory,
          label
        })
      if (error) {
        toast.error("Error al agregar insight")
        setActiveInsights(prev => prev.filter(t => t.id !== newInsight.id))
      }
    }
  }

  const totalTags = activeInsights.length
  if (totalTags === 0 && !canManageInsights) return null

  if (loading) return <Skeleton className="h-8" />

  return (
    <div className="relative mb-6">
      <div className="flex gap-1.5">
        {INSIGHT_CATEGORIES.map(cat => {
          const cfg = INSIGHT_CATEGORY_CONFIG[cat]
          const insightsForCat = activeInsights.filter(t => t.category === cat)
          const count = insightsForCat.length
          const isActive = activeCategory === cat

          // Pool of items for keyboard navigation
          const visibleTagsOrCategories = activeSubcategory
             ? FALLBACK_TAGS.filter(t => t.category === cat && (t.subcategory || "General") === activeSubcategory).map(t => t.label)
             : Array.from(new Set(FALLBACK_TAGS.filter(t => t.category === cat).map(t => t.subcategory || "General")))

          return (
            <Combobox
              key={cat}
              items={visibleTagsOrCategories}
              value={insightsForCat}
              onValueChange={() => {}} // Handled by inner checkboxes
              multiple
              open={isActive}
              onOpenChange={(open) => {
                setActiveCategory(open ? cat : null)
                if (!open) setActiveSubcategory(null)
              }}
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
              <ComboboxContent align="start" className="w-56 max-h-80 overflow-y-auto p-0 border-0 shadow-2xl">
                <CategoryDropdownContent
                  category={cat}
                  activeInsights={insightsForCat}
                  canEdit={canManageInsights}
                  activeSubcategory={activeSubcategory}
                  onSubcategoryChange={setActiveSubcategory}
                  onToggle={toggleInsight}
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
