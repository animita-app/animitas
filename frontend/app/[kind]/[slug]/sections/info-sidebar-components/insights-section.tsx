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
  visibleSubcategories,
  visibleTags,
  query,
  setQuery,
  onSubcategoryChange,
  onToggle,
  onClose,
}: CategoryDropdownProps & {
  query: string;
  setQuery: (q: string) => void;
  visibleSubcategories: string[];
  visibleTags: { label: string; subcategory: string }[];
}) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  const canCreate = canEdit && !!query.trim() && !visibleTags.some(
    t => t.label.toLowerCase() === query.trim().toLowerCase()
  )

  const isEmpty = visibleSubcategories.length === 0 && visibleTags.length === 0 && !canCreate

  const showSubcategoriesList = !activeSubcategory
  const selectedLabels = new Set(activeInsights.map(t => t.label))

  return (
    <div className="flex flex-col overflow-hidden w-full relative bg-neutral-900/50 backdrop-blur-md rounded-md">
      <ComboboxInput
        showTrigger={false}
        placeholder="Buscar..."
        autoFocus
        value={query}
        onChange={(e: any) => setQuery(e.target.value)}
        className="border-b border-white/5"
        onKeyDown={(e: any) => {
          // 1. Back navigation (Esc or Left Arrow)
          if (activeSubcategory && (e.key === 'Escape' || (e.key === 'ArrowLeft' && !query))) {
            e.preventDefault();
            e.stopPropagation();
            onSubcategoryChange(null);
            return;
          }

          // 2. Enter logic
          if (e.key === 'Enter') {
            // Priority: If we are at root (subcategories), the highlight selection
            // will be handled by the primitive's onSelect.
            // If we are in query mode and can create a tag:
            if (activeSubcategory && canCreate && !visibleSubcategories.length) {
              e.preventDefault();
              onToggle(query.trim(), activeSubcategory || "General", false);
              setQuery("")
            }
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
                  className="group flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none data-highlighted:bg-white/10 transition-colors pr-2 cursor-pointer select-none"
                  onSelect={(e) => {
                    console.log("👉 TAPPING / ENTER on:", sub);
                    // CRITICAL: Prevent the primitive from toggling this 'sub' as a value
                    e.preventDefault();
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
                    <ChevronRight className="size-4 text-white" />
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
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (activeCategory || activeSubcategory || query) {
      console.log("🔍 Insights State:", {
        category: activeCategory,
        subcategory: activeSubcategory,
        query: query || "(empty)"
      });
    }
  }, [activeCategory, activeSubcategory, query]);

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

          // Critical: Universal item pool for this category.
          // The primitive must know about EVERYTHING simultaneously to handle transitions.
          const items = Array.from(new Set([
            ...FALLBACK_TAGS.filter(t => t.category === cat).map(t => t.subcategory || "General"),
            ...FALLBACK_TAGS.filter(t => t.category === cat).map(t => t.label)
          ]))

          // Step 1 Filtering: Smart match subcategory name OR tag label inside
          const subcategories = Array.from(new Set(
            FALLBACK_TAGS.filter(t => t.category === cat).map(t => t.subcategory || "General")
          )).sort()

          const q = query.toLowerCase()
          const filteredSubcategories = query.trim()
            ? subcategories.filter(s => {
                if (s.toLowerCase().includes(q)) return true
                const tagsInSub = FALLBACK_TAGS.filter(t => t.category === cat && (t.subcategory || "General") === s)
                return tagsInSub.some(t => t.label.toLowerCase().includes(q))
              })
            : subcategories

          // Step 2 Filtering: Match labels within current subcategory (or global filter if sub is null)
          const filteredTags = query.trim()
            ? FALLBACK_TAGS.filter(t => t.category === cat)
                .filter(t => t.label.toLowerCase().includes(q))
                .map(t => ({ label: t.label, subcategory: t.subcategory || "General" }))
            : (activeSubcategory
                ? FALLBACK_TAGS.filter(t => t.category === cat && (t.subcategory || "General") === activeSubcategory)
                    .map(t => ({ label: t.label, subcategory: t.subcategory || "General" }))
                : []
              )

          return (
            <Combobox
              key={cat}
              items={items}
              value={insightsForCat.map(i => i.label)}
              onValueChange={() => {}}
              multiple
              open={isActive}
              onOpenChange={(open) => {
                console.log("Popover Open Change:", open, "Category:", cat);
                setActiveCategory(open ? cat : null)
                if (!open) {
                  setActiveSubcategory(null)
                  setQuery("")
                }
              }}
            >
              <ComboboxTrigger render={
                <button
                  className={cn(
                    "inline-flex items-center justify-center rounded-full pl-2.5 pr-1 py-0.5 text-sm font-medium transition-colors cursor-pointer outline-none",
                    count > 0
                      ? cfg.trigger
                      : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
                    isActive && "brightness-90 shadow-inner ring-1 ring-white/10"
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
                  query={query}
                  setQuery={setQuery}
                  visibleSubcategories={filteredSubcategories}
                  visibleTags={filteredTags}
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
