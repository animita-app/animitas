"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImagePlus } from "lucide-react"
import Image from "next/image"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CutoutText } from "@/components/cutout-text"
import { CurveSign } from "@/components/road-signs"
import { TrashCan } from "@/components/trash-can"
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
import { useDragToTrash } from "./use-drag-to-trash"


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

  // Throwing a photo away can be undone, so it happens at once.
  const removePhoto = useCallback((index: number) => {
    const removed = photos[index]
    if (!removed) return
    setPhotos(prev => prev.filter((_, i) => i !== index))
    toast("Foto botada", {
      action: { label: "Deshacer", onClick: () => setPhotos(prev => [...prev.slice(0, index), removed, ...prev.slice(index)]) },
    })
  }, [photos])
  const { trashRef, drag, overTrash, handlers } = useDragToTrash(removePhoto)

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
    <div className="flex min-h-svh w-full flex-col md:min-h-0">
      {/* The way back is the curve sign in the corner, as on an animita's page; the form needs no title of
          its own, so everything fits on one screen. */}
      <h1 className="sr-only">Añadir animita</h1>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSubmitting}
        aria-label="Volver sin publicar"
        className="fixed top-3 left-3 z-30 rounded-xs outline-none transition-[scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:-rotate-6 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
      >
        <CurveSign className="size-11" />
      </button>

      <div className="flex-1">
        <div className="grid gap-6 px-5 pt-16 pb-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10 md:pt-10">
          {/* The photos come first: on a wide screen they get their own column, the rest sits beside them. */}
          <section ref={el => { sectionRefs.current.photos = el }} aria-labelledby={`${ids}-photos`} className="space-y-2 md:sticky md:top-10 md:self-start">
            <h2 id={`${ids}-photos`} className="text-sm text-text">Fotos</h2>
            <ul className={cn("grid gap-3", previews.length ? "grid-cols-3 md:grid-cols-2" : "grid-cols-1")}>
              {previews.map((src, i) => {
                const lifted = drag?.index === i
                return (
                  <li
                    key={src}
                    tabIndex={0}
                    aria-label={`Foto ${i + 1}. Arrástrala al basurero o presiona Suprimir para botarla`}
                    onKeyDown={e => { if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removePhoto(i) } }}
                    {...handlers(i)}
                    className={cn(
                      "print-frame relative cursor-grab touch-none select-none p-1 pb-3 outline-none transition-opacity focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      i % 2 ? "rotate-1" : "-rotate-1",
                      lifted && "opacity-25"
                    )}
                  >
                    <Image src={src} alt="" width={240} height={240} unoptimized draggable={false} className="pointer-events-none aspect-square w-full object-cover" />
                  </li>
                )
              })}
              {photos.length < MAX_PHOTOS && (
                // An empty instant print waiting for its photo: pressing it picks one.
                // With no photos yet it's the big first thing to do; once there are some it's one more slot.
                <li className={cn(previews.length % 2 ? "-rotate-1" : "rotate-1", !previews.length && "w-32 md:mx-auto md:w-full md:max-w-60")}>
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    aria-describedby={errors.photos ? errorId("photos") : undefined}
                    className={cn(
                      "print-frame group flex w-full flex-col p-1 pb-3 outline-none transition-[rotate,scale] duration-200 hover:scale-[1.03] hover:rotate-0 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                      errors.photos && "ring-[3px] ring-destructive/30"
                    )}
                  >
                    {/* An unexposed print is near black, with the faint sheen of its chemistry. */}
                    <span className="flex aspect-square w-full items-center justify-center bg-text-strong/85 bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255_/_0.12),transparent_55%)] text-text-inverted shadow-[inset_0_0_14px_rgb(0_0_0_/_0.5)]">
                      {/* Fade the whole icon, never its color: an alpha color darkens where its strokes cross. */}
                      <ImagePlus aria-hidden className="opacity-60 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="pt-1.5 text-xs text-text-weak">{previews.length ? "Otra foto" : "Elegir fotos"}</span>
                  </button>
                </li>
              )}
            </ul>
            {errors.photos && <p id={errorId("photos")} className="text-sm text-destructive">{errors.photos}</p>}
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { addPhotos(e.target.files); e.target.value = "" }} />
          </section>

          <div className="flex flex-col gap-6">
          <section ref={el => { sectionRefs.current.location = el }} aria-labelledby={`${ids}-location`} className="space-y-2">
            <h2 id={`${ids}-location`} className="text-sm text-text">Dónde está</h2>
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
            <Label htmlFor={`${ids}-name`}>A quién recordamos</Label>
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
            <Label htmlFor={`${ids}-story`}>Su historia (opcional)</Label>
            <Textarea
              id={`${ids}-story`}
              value={story}
              onChange={e => setStory(e.target.value)}
              placeholder="Lo que sabes de ella, quién la cuida, desde cuándo está"
              rows={3}
              variant="paper"
              className="min-h-24 -rotate-[0.4deg]"
            />
          </div>
          </div>
        </div>
      </div>

      {drag && previews[drag.index] && createPortal(
        <div
          aria-hidden
          style={{ left: drag.left, top: drag.top, width: drag.width }}
          className={cn(
            "print-frame pointer-events-none fixed z-100 rotate-3 scale-105 p-1 pb-3 shadow-2xl transition-[scale,opacity] duration-150",
            overTrash && "scale-75 opacity-70"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previews[drag.index]} alt="" className="aspect-square w-full object-cover" />
        </div>,
        document.body
      )}

      {/* Floats at the bottom over a paper fade. While a photo is lifted, the trash takes its place. */}
      <div className="sticky bottom-0 z-20 shrink-0 bg-background px-5 pt-2 pb-safe before:pointer-events-none before:absolute before:inset-x-0 before:-top-10 before:h-10 before:bg-linear-to-t before:from-background before:to-transparent">
        <div className="flex min-h-20 items-end justify-center pb-4">
          {drag ? (
            <div ref={trashRef} className="flex flex-col items-center gap-1">
              <CutoutText text="bótala aquí" height={22} arc={16} />
              <TrashCan open={overTrash} />
            </div>
          ) : (
            <Button type="button" variant="sign" size="lg" className="w-full max-w-xs rotate-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Publicando…" : "Publicar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
