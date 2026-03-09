"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useSitePermissions } from "@/hooks/use-site-permissions"
import { HeritageSite } from "@/types/heritage"
import { toast } from "sonner"

interface InsightTag {
  id: string
  category: string
  label: string
}

interface SiteTag extends InsightTag {
  site_id: string
  tag_id: string
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  memorial: { label: 'Memorial', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  spiritual: { label: 'Espiritual', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  patrimonial: { label: 'Patrimonial', color: 'bg-amber-100 text-amber-700 border-amber-200' },
}

interface DetailedInfoSectionProps {
  site: HeritageSite
}

export function DetailedInfoSection({ site }: DetailedInfoSectionProps) {
  const { canManageInsights } = useSitePermissions(site)
  const [siteTags, setSiteTags] = useState<SiteTag[]>([])
  const [allTags, setAllTags] = useState<InsightTag[]>([])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const [tagsRes, siteTagsRes] = await Promise.all([
        supabase.from('insight_tags').select('*').order('category').order('label'),
        supabase.from('heritage_site_insight_tags')
          .select('site_id, tag_id, insight_tags(*)')
          .eq('site_id', site.id),
      ])
      if (tagsRes.data) setAllTags(tagsRes.data)
      if (siteTagsRes.data) {
        setSiteTags(siteTagsRes.data.map((r: any) => ({
          ...r.insight_tags,
          site_id: r.site_id,
          tag_id: r.tag_id,
        })))
      }
      setLoading(false)
    }
    fetch()
  }, [site.id])

  const availableTags = useMemo(() => {
    const siteTagIds = new Set(siteTags.map((t) => t.id))
    const filtered = allTags.filter((t) => !siteTagIds.has(t.id))
    if (!query) return filtered
    return filtered.filter((t) => t.label.toLowerCase().includes(query.toLowerCase()))
  }, [allTags, siteTags, query])

  const groupedAvailable = useMemo(() => {
    const groups: Record<string, InsightTag[]> = {}
    availableTags.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    })
    return groups
  }, [availableTags])

  const canCreateNew = query.trim() && !allTags.some(
    (t) => t.label.toLowerCase() === query.trim().toLowerCase()
  )

  const addTag = async (tag: InsightTag) => {
    setSiteTags((prev) => [...prev, { ...tag, site_id: site.id, tag_id: tag.id }])
    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_insight_tags')
      .insert({ site_id: site.id, tag_id: tag.id })
    if (error) {
      toast.error("Error al agregar insight")
      setSiteTags((prev) => prev.filter((t) => t.id !== tag.id))
    }
  }

  const removeTag = async (tagId: string) => {
    const removed = siteTags.find((t) => t.id === tagId)
    setSiteTags((prev) => prev.filter((t) => t.id !== tagId))
    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_insight_tags')
      .delete()
      .eq('site_id', site.id)
      .eq('tag_id', tagId)
    if (error) {
      toast.error("Error al quitar insight")
      if (removed) setSiteTags((prev) => [...prev, removed])
    }
  }

  const createAndAdd = async () => {
    const label = query.trim()
    if (!label) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('insight_tags')
      .insert({ category: 'memorial', label })
      .select()
      .single()
    if (error || !data) { toast.error("Error al crear insight"); return }
    setAllTags((prev) => [...prev, data])
    setQuery("")
    await addTag(data)
  }

  if (loading) return <div className="h-16 animate-pulse bg-background-weaker rounded-md" />

  if (siteTags.length === 0 && !canManageInsights) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {siteTags.map((tag) => {
        const config = CATEGORY_CONFIG[tag.category] || CATEGORY_CONFIG.memorial
        return (
          <Badge
            key={tag.id}
            variant="outline"
            className={cn('h-6 font-normal gap-1 transition-colors', config.color)}
          >
            {tag.label}
            {canManageInsights && (
              <button onClick={() => removeTag(tag.id)} className="ml-0.5 opacity-60 hover:opacity-100">
                <X className="size-3" />
              </button>
            )}
          </Badge>
        )
      })}

      {canManageInsights && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 text-xs gap-1 px-2 font-normal">
              <Plus className="size-3" />
              Añadir insight
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <div className="p-2 border-b border-border-weak">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar o crear..."
                className="w-full text-sm bg-transparent outline-none placeholder:text-text-weak"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {Object.entries(groupedAvailable).map(([cat, tags]) => (
                <div key={cat}>
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-weak">
                    {CATEGORY_CONFIG[cat]?.label || cat}
                  </p>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => { addTag(tag); setQuery(""); setOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-background-weak transition-colors"
                    >
                      <span className={cn('size-2 rounded-full', CATEGORY_CONFIG[tag.category]?.color.split(' ')[0])} />
                      {tag.label}
                    </button>
                  ))}
                </div>
              ))}
              {canCreateNew && (
                <button
                  onClick={createAndAdd}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-background-weak text-accent font-medium"
                >
                  <Plus className="size-3" />
                  Crear &quot;{query.trim()}&quot;
                </button>
              )}
              {availableTags.length === 0 && !canCreateNew && (
                <p className="px-2 py-3 text-xs text-text-weak text-center">Sin resultados</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
