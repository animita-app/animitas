"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Loader2, Camera, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup
} from "@/components/ui/field"
import { StoryHighlights, Highlight, HighlightCategory } from "@/components/ui/story-highlights"
import { LocationPicker } from "./location-picker"
import { createClient } from "@/lib/supabase/client"

// Removed MOCK_HIGHLIGHTS - now using dynamic detection

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  story: z.string().min(10, "La historia debe tener al menos 10 caracteres"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
    cityRegion: z.string(),
  }).nullable(),
  isPublic: z.boolean(),
})

type FormValues = {
  name: string
  story: string
  location: { lat: number; lng: number; address: string; cityRegion: string } | null
  isPublic: boolean
}

export default function AddPage() {
  const router = useRouter()
  const [isPreview, setIsPreview] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [detectedHighlights, setDetectedHighlights] = React.useState<Highlight[]>([])
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      story: "",
      location: null,
      isPublic: true,
    },
    mode: "onChange",
  })

  // Watch the story field for changes
  const storyValue = form.watch("story")

  // Analyze story for keywords when it changes
  React.useEffect(() => {
    if (!storyValue || storyValue.length < 10) {
      setDetectedHighlights([])
      return
    }

    const keywords = {
      patrimonial: [
        "accidente", "tránsito", "choque", "curva", "ruta", "camino",
        "feria", "trabajo", "1998", "gruta", "fallec", "muerte",
      ],
      spiritual: [
        "velas", "rosarios", "protección", "fortaleza", "acompaña",
        "presencia", "promesas", "ofrendas", "milagro", "fe",
      ],
      memory: [
        "familia", "vecinos", "recuerdan", "memoria", "amabilidad",
        "solidaridad", "comunidad", "ayudar",
      ],
    }

    const highlights: Highlight[] = []
    const storyLower = storyValue.toLowerCase()
    const foundTexts = new Set<string>()

    Object.entries(keywords).forEach(([category, words]) => {
      words.forEach((word) => {
        if (storyLower.includes(word) && !foundTexts.has(word)) {
          foundTexts.add(word)
          highlights.push({
            text: word,
            category: category as HighlightCategory,
          })
        }
      })
    })

    setDetectedHighlights(highlights)
  }, [storyValue])

  // Auto-location fetch
  React.useEffect(() => {
    if (!form.getValues("location")) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            form.setValue("location", {
              lat: latitude,
              lng: longitude,
              address: "Ubicación detectada",
              cityRegion: "Cerca de ti"
            }, { shouldValidate: true })
          },
          (error) => {
            console.error("Error fetching location:", error)
          }
        )
      }
    }
  }, [form])

  async function onSubmit(values: FormValues) {
    if (!values.location) {
      toast.error("La ubicación es obligatoria")
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const imageUrls: string[] = []

      // 1. Upload images to Supabase Storage if any
      if (imageFiles.length > 0) {
        toast.loading("Subiendo fotos...", { id: "uploading" })
        const uploadPromises = imageFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `animitas/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('base')
            .upload(filePath, file)

          if (uploadError) throw new Error("Error subiendo " + file.name)

          const { data } = supabase.storage.from('base').getPublicUrl(filePath)
          return data.publicUrl
        })

        const urls = await Promise.all(uploadPromises)
        imageUrls.push(...urls)
        toast.dismiss("uploading")
      }

      const response = await fetch('/api/heritage-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          story: values.story,
          isPublic: values.isPublic,
          location: values.location,
          images: imageUrls
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Error al crear la animita')
      }

      toast.success("Animita creada con éxito")
      router.push(`/animita/${data.slug}`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error al crear la animita")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh w-full bg-background flex flex-col items-center pt-20 pb-20 px-6">
      <div className="w-full max-w-sm space-y-12">
        {/* Simple Title Section */}
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-strong">Registra una animita</h1>
          <p className="text-base text-text-weak font-normal">Preserva su memoria en el mapa colectivo</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-10">
            <FieldGroup className="space-y-10">
              {/* Fotos section */}
              <Field className="space-y-3">
                <FieldLabel className="text-sm font-bold uppercase tracking-tight text-text-weak font-ibm-plex-mono">
                  Fotos <span className="text-xs font-normal">({imageFiles.length}/5)</span>
                </FieldLabel>

                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                    {imageFiles.map((file, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-background-weak border border-border-weak group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {imageFiles.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border border-dashed border-border-weak rounded-md flex flex-col items-center justify-center bg-background-weak cursor-pointer hover:bg-background-weaker transition-colors text-text-weak hover:text-text-strong gap-2"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm font-medium">Click para subir imágenes</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (imageFiles.length + files.length > 5) {
                      toast.error("Máximo 5 imágenes permitidas")
                      return
                    }
                    setImageFiles(prev => [...prev, ...files])
                  }}
                />
              </Field>

              {/* Name Field */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-3">
                    <FieldLabel htmlFor={field.name} className="text-sm font-bold uppercase tracking-tight text-text-weak font-ibm-plex-mono">Nombre</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Ej: Animita de Romualdito"
                      aria-invalid={fieldState.invalid}
                      className="h-11 border-border-weak rounded-md text-base"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Story Field */}
              <Controller
                name="story"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name} className="text-sm font-bold uppercase tracking-tight text-text-weak font-ibm-plex-mono">Historia</FieldLabel>
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => setIsPreview(!isPreview)}
                          className="text-sm font-bold text-accent hover:underline"
                        >
                          {isPreview ? "Editar" : "Ver análisis"}
                        </button>
                      )}
                    </div>
                    {isPreview && detectedHighlights.length > 0 ? (
                      <div
                        className="p-4 border border-border-weak rounded-md text-base cursor-pointer bg-background-weak"
                        onClick={() => setIsPreview(false)}
                      >
                        <StoryHighlights text={field.value} highlights={detectedHighlights} />
                      </div>
                    ) : isPreview && detectedHighlights.length === 0 ? (
                      <div
                        className="p-4 border border-border-weak rounded-md text-base cursor-pointer bg-background-weak text-center text-text-weak"
                        onClick={() => setIsPreview(false)}
                      >
                        <p>No se detectaron palabras clave en la historia.</p>
                        <p className="text-sm mt-2">Escribe más para ver el análisis automático.</p>
                      </div>
                    ) : (
                      <Textarea
                        {...field}
                        id={field.name}
                        placeholder="Escribe la historia de esta animita..."
                        className="min-h-[140px] border-border-weak resize-none rounded-md text-base p-3"
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Location Field */}
              <Controller
                name="location"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-3">
                    <FieldLabel className="text-sm font-bold uppercase tracking-tight text-text-weak font-ibm-plex-mono">Ubicación</FieldLabel>
                    <LocationPicker
                      value={field.value}
                      onChange={(loc) => field.onChange(loc)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Public Switch */}
              <Controller
                name="isPublic"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal" className="justify-between items-center bg-background-weak/30 p-4 rounded-lg border border-border-weak">
                    <div className="space-y-1">
                      <FieldLabel htmlFor={field.name} className="text-base font-bold text-text-strong">Visible para todos</FieldLabel>
                      <FieldDescription className="text-sm">Cualquiera podrá encontrarla en el mapa</FieldDescription>
                    </div>
                    <Switch
                      id={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          {/* Action Button */}
          <div className="space-y-6 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="w-full h-12 font-bold rounded-md text-base shadow-sm"
            >
              {isSubmitting ? "Publicando..." : "Registrar ubicación"}
            </Button>
            <p className="text-sm text-text-weak text-center leading-relaxed">
              Al continuar, aceptas las <span className="font-bold text-text-strong cursor-pointer hover:underline">Normas de la Comunidad</span>.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
