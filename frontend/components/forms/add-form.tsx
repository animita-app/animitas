"use client"

import * as React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import dynamic from "next/dynamic"
const LocationSelector = dynamic(() => import("@/components/search/location-selector").then(mod => mod.LocationSelector), { ssr: false })
import type { Location } from "@/components/search/location-selector"
import { TwoLevelCombobox, type TwoLevelCategory } from "@/components/ui/two-level-combobox"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { useHeritageTaxonomy } from "@/hooks/use-heritage-taxonomy"
import { useLocationSearch } from "@/hooks/use-location-search"
import { retryWithBackoff, validateImageFile } from "@/lib/retry-utils"

const KIND_TITLE_PLACEHOLDERS: Record<string, string> = {
  santuarios: "¿A quién recordamos?",
  funerales: "¿Cómo se llama este lugar de memoria?",
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
  const [location, setLocation] = useState<Location[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryComboOpen, setCategoryComboOpen] = useState(false)
  const [extractedInsights, setExtractedInsights] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [failedUploads, setFailedUploads] = useState<Set<string>>(new Set())

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, kindsForCategory])

  const canSubmit = title.trim().length > 0 && photos.length >= 1 && location.length > 0 && !isScanning && !isSubmitting


  const handleCancel = () => {
    if (onCancel) onCancel()
    else router.back()
  }

  const handleSubmit = async () => {
    for (const file of photos) {
      const validationError = validateImageFile(file)
      if (validationError) {
        toast.error(validationError)
        return
      }
    }

    setIsScanning(true)

    let insights: any = null
    let insightError: string | null = null

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const insightRes = await fetch('/api/extract-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, title }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (insightRes.ok) {
        const result = await insightRes.json()
        if (result.error) {
          insightError = result.error
        } else {
          insights = result.insights
          setExtractedInsights(result.insights)
        }
      } else {
        const errorData = await insightRes.json().catch(() => ({}))
        insightError = errorData.error || `Error del servidor: ${insightRes.status}`
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        insightError = 'El análisis de contenido tardó demasiado. Se continuará sin análisis.'
      } else {
        insightError = `No se pudo analizar el contenido: ${err.message || 'Error desconocido'}`
      }
    }

    if (insightError) {
      toast.warning(insightError, { duration: 4000 })
    }

    setIsScanning(false)
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const imageUrls: string[] = []
      const uploadedPaths: string[] = []

      for (const file of photos) {
        try {
          const ext = file.name.split('.').pop()
          const path = `users/${currentUser?.id}/animitas/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

          await retryWithBackoff(
            async () => {
              const { error } = await supabase.storage.from('base').upload(path, file)
              if (error) throw new Error(error.message)
            },
            { maxAttempts: 3, initialDelayMs: 500 }
          )

          const { data: { publicUrl } } = supabase.storage.from('base').getPublicUrl(path)
          imageUrls.push(publicUrl)
          uploadedPaths.push(path)
        } catch (err: any) {
          toast.error(`Error subiendo ${file.name}: ${err.message}`)
          setFailedUploads(prev => new Set([...prev, file.name]))
        }
      }

      if (imageUrls.length === 0) {
        toast.error('No se pudo subir ninguna imagen. Intenta de nuevo.')
        setIsSubmitting(false)
        return
      }

      if (imageUrls.length < photos.length) {
        toast.warning(`${photos.length - imageUrls.length} imágenes fallaron. Continuando con las ${imageUrls.length} exitosas.`)
      }

      setExtractedInsights(insights)

      const [lng, lat] = location[0].coords
      const res = await fetch('/api/heritage-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          story,
          isPublic: true,
          kind,
          location: {
            lat,
            lng,
            address: location[0].address,
            cityRegion: location[0].region
          },
          images: imageUrls,
          categories: [category]
        })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Error al crear la animita')
      }

      if (extractedInsights && data.success && data.id) {
        try {
          const supabase = createClient()
          const insightsToInsert = []

          if (extractedInsights.memorial?.death_cause) {
            insightsToInsert.push({
              id: crypto.randomUUID(),
              site_id: data.id,
              category: 'memorial',
              label: extractedInsights.memorial.death_cause
            })
          }
          if (extractedInsights.memorial?.social_roles?.length) {
            extractedInsights.memorial.social_roles.forEach((role: string) => {
              insightsToInsert.push({
                id: crypto.randomUUID(),
                site_id: data.id,
                category: 'memorial',
                label: role
              })
            })
          }
          if (extractedInsights.spiritual?.rituals_mentioned?.length) {
            extractedInsights.spiritual.rituals_mentioned.forEach((ritual: string) => {
              insightsToInsert.push({
                id: crypto.randomUUID(),
                site_id: data.id,
                category: 'spiritual',
                label: ritual
              })
            })
          }
          if (extractedInsights.patrimonial?.form) {
            insightsToInsert.push({
              id: crypto.randomUUID(),
              site_id: data.id,
              category: 'patrimonial',
              label: extractedInsights.patrimonial.form
            })
          }

          if (insightsToInsert.length > 0) {
            const { error } = await supabase.from('site_insights').insert(insightsToInsert)
            if (error) {
              console.error('[add-form] Failed to insert insights:', error.message)
            } else {
              const { data: savedInsights } = await supabase
                .from('site_insights')
                .select('*')
                .eq('site_id', data.id)
              console.log('[add-form] Insights saved for site:', data.id, savedInsights)
            }
          }
        } catch (err) {
          console.error('[add-form] Error saving insights:', err)
        }
      }

      toast.success("¡Registrada!")
      router.push(`/${kind}/${data.slug}`)
    } catch (err: any) {
      toast.error(err.message || "Error al crear la animita")
      setIsSubmitting(false)
      setFailedUploads(new Set())
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
                  <div className="md:h-[26px] min-w-40 *:h-[26px] w-fit md:bg-accent/10 md:rounded-full cursor-pointer">
                    <Badge
                      variant="secondary"
                      className="text-sm min-w-24 rounded-full gap-0.5 bg-accent text-white"
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
                contentWidth="w-[calc(100vw-2rem)] md:w-80"
              />
            </div>

            <Input
              autoFocus
              placeholder={KIND_TITLE_PLACEHOLDERS[kind] || "¿Cómo se llama este lugar?"}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-lg md:text-lg font-semibold bg-transparent border-none shadow-none resize-none focus-visible:ring-0 shrink-0"
            />

            <div className="relative">
              <Textarea
                placeholder="¿Cuál es su historia?"
                value={story}
                onChange={e => setStory(e.target.value)}
                className="bg-transparent border-none shadow-none resize-none focus-visible:ring-0"
                disabled={isScanning}
              />
            </div>
          </div>
        </div>
        {isScanning && <LoadingOverlay />}
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
            className="px-4 relative"
          >
            <span className={isSubmitting ? 'invisible' : 'transition-opacity duration-300'}>Publicar</span>
            {isSubmitting && (
              <Spinner className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in duration-300" />
            )}
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
          const validFiles: File[] = []

          files.forEach(file => {
            const error = validateImageFile(file)
            if (error) {
              toast.error(`${file.name}: ${error}`)
            } else {
              validFiles.push(file)
            }
          })

          if (validFiles.length > 0) {
            setPhotos(prev => [...prev, ...validFiles])
            setFailedUploads(new Set())
          }
        }}
      />
    </div>
  )
}
