"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

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
      const response = await fetch('/api/heritage-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          story: values.story,
          isPublic: values.isPublic,
          location: values.location
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
    <div className="min-h-svh w-full bg-white flex flex-col items-center pt-20 pb-20 px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Simple Title Section */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black">Registra una animita</h1>
          <p className="text-sm text-text-weak font-normal">Preserva su memoria en el mapa colectivo</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup className="space-y-6">
            {/* Photos (Simplified Placeholder for now) */}
            <Field>
              <FieldLabel className="text-xs font-bold uppercase tracking-tight text-text-weak">Fotos</FieldLabel>
              <div className="w-full h-32 border border-border-weak rounded-md flex items-center justify-center bg-neutral-light-1 cursor-pointer hover:bg-neutral-light-2 transition-colors">
                <span className="text-xs text-text-weak font-medium">Click para subir imagenes</span>
              </div>
            </Field>

            {/* Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-xs font-bold uppercase tracking-tight text-text-weak">Nombre</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Ej: Animita de Romualdito"
                    aria-invalid={fieldState.invalid}
                    className="h-10 border-border-weak focus-visible:ring-black rounded-md"
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
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name} className="text-xs font-bold uppercase tracking-tight text-text-weak">Historia</FieldLabel>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className="text-xs font-bold text-[#FF5A5F] hover:underline"
                      >
                        {isPreview ? "Editar" : "Ver análisis"}
                      </button>
                    )}
                  </div>
                  {isPreview && detectedHighlights.length > 0 ? (
                    <div
                      className="p-4 border border-border-weak rounded-md text-sm cursor-pointer bg-gray-50"
                      onClick={() => setIsPreview(false)}
                    >
                      <StoryHighlights text={field.value} highlights={detectedHighlights} />
                    </div>
                  ) : isPreview && detectedHighlights.length === 0 ? (
                    <div
                      className="p-4 border border-border-weak rounded-md text-sm cursor-pointer bg-gray-50 text-center text-text-weak"
                      onClick={() => setIsPreview(false)}
                    >
                      <p>No se detectaron palabras clave en la historia.</p>
                      <p className="text-xs mt-1">Escribe más para ver el análisis automático.</p>
                    </div>
                  ) : (
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Escribe la historia de esta animita..."
                      className="min-h-[120px] border-border-weak resize-none focus-visible:ring-black rounded-md"
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold uppercase tracking-tight text-text-weak">Ubicación</FieldLabel>
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
                <Field orientation="horizontal" className="justify-between items-center">
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor={field.name} className="text-sm font-medium">Visible para todos</FieldLabel>
                    <FieldDescription className="text-xs">Cualquiera podrá encontrarla en el mapa</FieldDescription>
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

          {/* Action Button */}
          <div className="space-y-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="w-full bg-black text-white hover:bg-neutral-800 h-10 font-bold rounded-md"
            >
              {isSubmitting ? "Publicando..." : "Continuar"}
            </Button>
            <p className="text-xs text-text-weak text-center leading-relaxed">
              Al continuar, aceptas las <span className="font-bold text-black cursor-pointer hover:underline">Normas de la Comunidad</span>.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
