import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { InsightPreset } from "@/types/heritage"

interface PresetsByCategory {
  [insightCategory: string]: {
    [presetCategory: string]: string[]
  }
}

export function useInsightPresets(kindId?: string) {
  const [presets, setPresets] = useState<InsightPreset[]>([])
  const [presetsByCategory, setPresetsByCategory] = useState<PresetsByCategory>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!kindId) {
      setPresets([])
      setPresetsByCategory({})
      return
    }

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    supabase
      .from("insight_presets")
      .select("*")
      .eq("kind_id", kindId)
      .then(({ data, error }: any) => {
        if (error) {
          console.error("[useInsightPresets] Error:", error)
          setError(error.message)
          setPresets([])
          setPresetsByCategory({})
        } else if (data) {
          setPresets(data)
          const byCategory: PresetsByCategory = {
            patrimonial: {},
            spiritual: {},
            memorial: {},
          }
          data.forEach((preset: any) => {
            const insightCategories = preset.insight_category
              ? [preset.insight_category]
              : ['patrimonial', 'spiritual', 'memorial']

            insightCategories.forEach((insightCat: string) => {
              if (!byCategory[insightCat]) {
                byCategory[insightCat] = {}
              }
              if (!byCategory[insightCat][preset.category]) {
                byCategory[insightCat][preset.category] = []
              }
              byCategory[insightCat][preset.category].push(preset.label)
            })
          })
          setPresetsByCategory(byCategory)
        } else {
          setPresets([])
          setPresetsByCategory({})
        }
        setIsLoading(false)
      })
  }, [kindId])

  const addPreset = async (presetCategory: string, label: string, insightCategory: string = 'patrimonial') => {
    if (!kindId) return false

    const supabase = createClient()
    const { error } = await supabase.from("insight_presets").insert([
      {
        kind_id: kindId,
        category: presetCategory,
        label,
        insight_category: insightCategory,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ])

    if (error) {
      console.error("[addPreset] Error:", error)
      return false
    }
    const newPreset: InsightPreset = {
      id: crypto.randomUUID(),
      kind_id: kindId,
      category: presetCategory,
      label,
      created_at: new Date().toISOString(),
    }

    setPresets([...presets, newPreset])
    setPresetsByCategory((prev) => ({
      ...prev,
      [insightCategory]: {
        ...(prev[insightCategory] || {}),
        [presetCategory]: [...((prev[insightCategory] || {})[presetCategory] || []), label],
      },
    }))

    return true
  }

  return { presets, presetsByCategory, isLoading, error, addPreset }
}
