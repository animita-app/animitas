"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Camera, ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CutoutText } from "@/components/cutout-text"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { isDemo } from "@/lib/demo/flag"
import { TABLES } from "@/lib/animitas"
import { slugify } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { animitaHref } from "@/lib/routes"
import { ANIMITA_NAME_MIN } from "@/lib/validators/animita"
import { LocationPicker, type PickedLocation } from "./location-picker"
import { uploadAnimitaPhoto } from "@/lib/photos"


const MAX_PHOTOS = 5

type Field = "photos" | "location" | "name"
type Errors = Partial<Record<Field, string>>

export function validateAnimita({ photos, location, name }: { photos: File[]; location: PickedLocation | null; name: string }): Errors {
  const errors: Errors = {}
  if (photos.length === 0) errors.photos = "Añade al menos una foto"
  if (!location) errors.location = "Mueve el mapa hasta dejar el pin sobre la animita"
  if (name.trim().length < ANIMITA_NAME_MIN) errors.name = "Escribe su nombre, al menos 3 letras"
  return errors
}

interface AddFormProps {
  onCancel?: () => void
}

export function AddForm({ onCancel }: AddFormProps) {
  const router = useRouter()
  const { currentUser } = useUser()
  const ids = useId()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const sectionRefs = useRef<Partial<Record<Field, HTMLElement | null>>>({})

  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [location, setLocation] = useState<PickedLocation | null>(null)
  const [name, setName] = useState("")
  const [story, setStory] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const urls = photos.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [photos])

  const addPhotos = (files: FileList | null) => {
    const list = Array.from(files ?? [])
    if (photos.length + list.length > MAX_PHOTOS) {
      setErrors(prev => ({ ...prev, photos: `Puedes subir hasta ${MAX_PHOTOS} fotos` }))
      return
    }
    setPhotos(prev => [...prev, ...list])
    setErrors(prev => ({ ...prev, photos: undefined }))
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    else router.back()
  }

  const handleSubmit = async () => {
    const found = validateAnimita({ photos, location, name })
    setErrors(found)
    const first = (["photos", "location", "name"] as Field[]).find(f => found[f])
    if (first) {
      if (first === "name") nameRef.current?.focus()
      else sectionRefs.current[first]?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const images = await Promise.all(photos.map(file => uploadAnimitaPhoto(supabase, currentUser!.id, file)))

      let data: { slug: string }
      if (isDemo()) {
        // Demo mode keeps the new animita in this browser instead of posting it.
        const { data: row, error } = await supabase
          .from(TABLES.animitas)
          .insert({
            title: name.trim(),
            story,
            slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
            location: { type: 'Point', coordinates: [location!.lng, location!.lat] },
            address: location!.address ?? null,
            city_region: location!.cityRegion ?? null,
            images,
          })
          .select('slug')
          .single()
        if (error || !row) throw new Error(error?.message || 'Error al guardar')
        data = row
      } else {
        const res = await fetch('/api/animitas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, story, isPublic: true, location, images }),
        })
        data = await res.json()
        if (!res.ok) throw new Error((data as any)?.error || 'Error al guardar')
      }

      toast.success(`Añadiste la animita de ${name.trim()}`)
      router.push(animitaHref(data.slug))
    } catch (err: any) {
      toast.error("No se pudo publicar la animita", {
        description: err?.message,
        action: { label: "Reintentar", onClick: handleSubmit },
      })
      setIsSubmitting(false)
    }
  }

  const errorId = (field: Field) => `${ids}-${field}-error`

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 py-4 pl-5 pr-16">
        <h1 className="sr-only">Añadir animita</h1>
        <CutoutText text="añadir" height={30} arc={20} />
        <div className="flex items-center gap-4">
          <Button variant="link" className="h-auto p-0 text-text-weak" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" variant="sign" size="lg" className="rotate-1" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-8 px-5 pt-2 pb-safe">
          <section ref={el => { sectionRefs.current.photos = el }} aria-labelledby={`${ids}-photos`} className="space-y-2">
            <h2 id={`${ids}-photos`} className="sr-only">Fotos</h2>
            <CutoutText text="fotos" height={20} />
            {previews.length > 0 && (
              <ul className="grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <li key={src} className={cn("print-frame relative p-1 pb-3", i % 2 ? "rotate-1" : "-rotate-1")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="secondary"
                      aria-label={`Quitar foto ${i + 1}`}
                      className="absolute top-1 right-1"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {photos.length < MAX_PHOTOS && (
              <div className="flex flex-wrap items-center gap-4">
                <Button type="button" variant="sign" size="lg" className="-rotate-1" onClick={() => cameraRef.current?.click()} aria-describedby={errors.photos ? errorId("photos") : undefined}>
                  <Camera aria-hidden />
                  Tomar foto
                </Button>
                <Button type="button" variant="link" className="h-auto p-0 text-text-weak" onClick={() => galleryRef.current?.click()}>
                  <ImagePlus />
                  Elegir fotos
                </Button>
              </div>
            )}
            {errors.photos && <p id={errorId("photos")} className="text-sm text-destructive">{errors.photos}</p>}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { addPhotos(e.target.files); e.target.value = "" }} />
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { addPhotos(e.target.files); e.target.value = "" }} />
          </section>

          <section ref={el => { sectionRefs.current.location = el }} aria-labelledby={`${ids}-location`} className="space-y-2">
            <h2 id={`${ids}-location`} className="sr-only">Dónde está</h2>
            <CutoutText text="dónde está" height={20} />
            <LocationPicker
              value={location}
              onChange={(next) => {
                setLocation(next)
                setErrors(prev => ({ ...prev, location: undefined }))
              }}
              invalid={!!errors.location}
              describedBy={errors.location ? errorId("location") : undefined}
            />
            {errors.location && <p id={errorId("location")} className="text-sm text-destructive">{errors.location}</p>}
          </section>

          <div className="space-y-2">
            <Label htmlFor={`${ids}-name`} className="sr-only">A quién recordamos</Label>
            <CutoutText text="a quién recordamos" height={20} />
            <Input
              ref={nameRef}
              id={`${ids}-name`}
              value={name}
              onChange={e => {
                setName(e.target.value)
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
              }}
              placeholder="Nombre de la animita"
              autoComplete="off"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? errorId("name") : undefined}
              variant="paper"
              className="rotate-[0.4deg]"
            />
            {errors.name && <p id={errorId("name")} className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${ids}-story`} className="sr-only">Su historia (opcional)</Label>
            <CutoutText text="su historia" height={20} />
            <Textarea
              id={`${ids}-story`}
              value={story}
              onChange={e => setStory(e.target.value)}
              placeholder="Lo que sabes de ella, quién la cuida, desde cuándo está"
              rows={5}
              variant="paper"
              className="min-h-32 -rotate-[0.4deg]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
