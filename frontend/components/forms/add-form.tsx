"use client"

import * as React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MapPin, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { StoryHighlights, Highlight, HighlightCategory } from "@/components/ui/story-highlights"
import { LocationSelector, type Location } from "@/components/search/location-selector"
import { TwoLevelCombobox, type TwoLevelCategory } from "@/components/ui/two-level-combobox"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { useHeritageTaxonomy } from "@/hooks/use-heritage-taxonomy"
import { useLocationSearch } from "@/hooks/use-location-search"
import { cn } from "@/lib/utils"

const KIND_TITLE_PLACEHOLDERS: Record<string, string> = {
  santuarios: "¿A quién recordamos?",
  funerales: "¿Cómo se llama este lugar de memoria?",
}

function truncateAddress(address: string): string {
  const parts = address.split(',')
  if (parts.length > 2) {
    return `${parts[0]}, ${parts[1]}`
  }
  return address
}

const KEYWORDS: Record<HighlightCategory, string[]> = {
  patrimonial: ["accidente", "tránsito", "choque", "curva", "ruta", "camino", "feria", "trabajo", "gruta", "fallec", "muerte"],
  spiritual: ["velas", "rosarios", "protección", "fortaleza", "acompaña", "presencia", "promesas", "ofrendas", "milagro", "fe"],
  memory: ["familia", "vecinos", "recuerdan", "memoria", "amabilidad", "solidaridad", "comunidad", "ayudar"],
}

function detectHighlights(text: string): Highlight[] {
  const found = new Set<string>()
  const highlights: Highlight[] = []
  const lower = text.toLowerCase()
  Object.entries(KEYWORDS).forEach(([category, words]) => {
    words.forEach(word => {
      if (lower.includes(word) && !found.has(word)) {
        found.add(word)
        highlights.push({ text: word, category: category as HighlightCategory })
      }
    })
  })
  return highlights
}

interface AddFormProps {
  onCancel?: () => void
}

export function AddForm({ onCancel }: AddFormProps) {
  const router = useRouter()
  const { currentUser } = useUser()
  const { categories, kinds } = useHeritageTaxonomy()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState("usos-sociales-rituales-festivos")
  const [kind, setKind] = useState("santuarios")
  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [location, setLocation] = useState<Location | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedHighlights, setScannedHighlights] = useState<Highlight[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryComboOpen, setCategoryComboOpen] = useState(false)

  const { isLoading: isSearchingLocation, searchResults: locationResults, handleSearch: handleLocationSearch } = useLocationSearch()

  const categoryId = categories.find(c => c.slug === category)?.id
  const kindsForCategory = categoryId ? kinds.filter(k => k.category_id === categoryId) : kinds

  const comboCategories = React.useMemo<TwoLevelCategory[]>(() =>
    categories.map(cat => ({
      key: cat.id,
      label: cat.name,
      items: kinds.filter(k => k.category_id === cat.id).map(k => ({
        value: k.slug,
        label: k.name
      }))
    })),
    [categories, kinds]
  )

  useEffect(() => {
    if (kindsForCategory.length > 0 && !kindsForCategory.some(k => k.slug === kind)) {
      setKind(kindsForCategory[0].slug)
    }
  }, [category, kindsForCategory])

  const canSubmit = title.trim().length > 0 && photos.length >= 1 && !!location && !isScanning && !isSubmitting


  const handleCancel = () => {
    if (onCancel) onCancel()
    else router.back()
  }

  const handleSubmit = async () => {
    if (!location) { toast.error("La ubicación es obligatoria"); return }
    if (photos.length === 0) { toast.error("Agrega al menos una foto"); return }

    setIsScanning(true)
    setScannedHighlights([])

    let extractedInsights: any = {}

    try {
      toast.loading("Extrayendo insights...", { id: "scanning" })

      const insightRes = await fetch('/api/extract-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, title })
      })
      const { insights } = await insightRes.json()
      extractedInsights = insights

      const highlightsList: Array<{ text: string; type: 'section' | 'value' }> = []

      if (insights?.memorial?.death_cause) {
        highlightsList.push({ text: `Causa: ${insights.memorial.death_cause}`, type: 'value' })
      }
      if (insights?.memorial?.social_roles?.length) {
        highlightsList.push({ text: `Roles: ${insights.memorial.social_roles.join(', ')}`, type: 'value' })
      }
      if (insights?.spiritual?.rituals_mentioned?.length) {
        highlightsList.push({ text: `Rituales: ${insights.spiritual.rituals_mentioned.join(', ')}`, type: 'value' })
      }
      if (insights?.patrimonial?.form) {
        highlightsList.push({ text: `Forma: ${insights.patrimonial.form}`, type: 'value' })
      }

      toast.dismiss("scanning")

      for (let i = 0; i < highlightsList.length; i++) {
        await new Promise(r => setTimeout(r, 300))
        setScannedHighlights(prev => [...prev, { text: highlightsList[i].text, category: 'patrimonial' as const }])
      }

      await new Promise(r => setTimeout(r, 600))
    } catch (err) {
      console.error('Error extracting insights:', err)
      toast.dismiss("scanning")
      toast.error("No se pudo extraer insights, continuando sin ellos...", { duration: 2000 })
      await new Promise(r => setTimeout(r, 1000))
    }

    setIsScanning(false)
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const imageUrls: string[] = []

      toast.loading("Subiendo fotos...", { id: "uploading" })
      const urls = await Promise.all(photos.map(async (file) => {
        const ext = file.name.split('.').pop()
        const path = `users/${currentUser?.id}/animitas/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { error } = await supabase.storage.from('base').upload(path, file)
        if (error) throw new Error(`Error subiendo ${file.name}`)
        return supabase.storage.from('base').getPublicUrl(path).data.publicUrl
      }))
      imageUrls.push(...urls)
      toast.dismiss("uploading")

      const res = await fetch('/api/heritage-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          story,
          isPublic: true,
          kind,
          location,
          images: imageUrls,
          categories: [category],
          insights: extractedInsights
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Error al crear la animita')

      toast.success("¡Animita registrada!")
      router.push(`/animita/${data.slug}`)
    } catch (err: any) {
      toast.error(err.message || "Error al crear la animita")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header */}
      <div className="relative flex items-center justify-between p-2 border-b border-border-weak shrink-0">
        <Button variant="ghost" size="icon" className="opacity-0 ml-auto text-text-weak" onClick={handleCancel}>
          <X />
        </Button>
        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-text-strong">Crea una entrada</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex gap-3 px-4 pt-6">
          {/* <Avatar className="size-8 shrink-0 mt-0.5">
            <AvatarImage src={currentUser?.avatarUrl} />
            <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() ?? "A"}</AvatarFallback>
          </Avatar> */}

          <div className="-ml-1.5 flex-1 flex flex-col gap-1 pb-4">
          {/* Photo thumbnails */}
          <div className="ml-3 grid grid-cols-3 gap-1.5 pb-4 pt-0 shrink-0">
            {photos.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-background-weak border border-border-weak group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt="" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  className="cursor-pointer absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center hover:brightness-95 cursor-pointer relative aspect-square rounded-md overflow-hidden bg-background-weak border border-border-weak group"
            >
              <Plus className="size-10 stroke-[1.5px] !text-text-weaker/70" />
            </button>
          </div>

          {/* Category and Kind selector */}
          <div className="ml-2 mb-2 shrink-0">
            <TwoLevelCombobox
              trigger={
                <div className="min-h-[26px] *:min-h-[26px] w-fit md:bg-accent/10 md:rounded-full cursor-pointer">
                  <Badge
                    variant="secondary"
                    className="text-sm rounded-full gap-0.5 bg-accent text-white"
                  >
                    {categories.find(c => c.slug === category)?.name}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-sm mt-1.5 md:mt-0 pl-1.5 rounded-full gap-0.5 md:bg-transparent text-accent"
                  >
                    {kinds.find(k => k.slug === kind)?.name}
                  </Badge>
                </div>
              }
              open={categoryComboOpen}
              onOpenChange={setCategoryComboOpen}
              categories={comboCategories}
              selectedValues={[kind]}
              onToggle={(value) => {
                setKind(value)
                const selectedCat = comboCategories.find(c => c.items.some(i => i.value === value))
                if (selectedCat) {
                  setCategory(categories.find(c => c.id === selectedCat.key)?.slug || category)
                }
                setCategoryComboOpen(false)
              }}
              contentWidth="w-[calc(100vw-2rem)] md:w-96"
            />
          </div>

          <Input
            autoFocus
            placeholder={KIND_TITLE_PLACEHOLDERS[kind] || "¿Cómo se llama este lugar?"}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-lg md:text-lg font-semibold bg-transparent border-none shadow-none resize-none focus-visible:ring-0 shrink-0"
          />

          {isScanning ? (
            <div className="text-sm text-text p-1">
              <StoryHighlights text={story} highlights={scannedHighlights} />
            </div>
          ) : (
            <Textarea
              placeholder="¿Cuál es su historia?"
              value={story}
              onChange={e => setStory(e.target.value)}
              className="bg-transparent border-none shadow-none resize-none focus-visible:ring-0"
            />
          )}
        </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="border-t border-border-weak p-3 flex items-center gap-2 shrink-0">
        <LocationSelector
          value={location}
          onChange={setLocation}
          onSearch={handleLocationSearch}
          searchResults={locationResults}
          isLoading={isSearchingLocation}
        />

        <div className="ml-auto">
          <Button
            size="sm"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
            className="px-4"
          >
            {isSubmitting ? <Spinner /> : "Publicar"}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (photos.length + files.length > 5) { toast.error("Máximo 5 fotos"); return }
          setPhotos(prev => [...prev, ...files])
        }}
      />
    </div>
  )
}
