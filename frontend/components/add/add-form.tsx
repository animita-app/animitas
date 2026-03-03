"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { LocationPicker } from "@/app/add/location-picker"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type LocationValue = {
  lat: number
  lng: number
  address: string
  cityRegion: string
}

type Step = 'photos' | 'name' | 'story' | 'location' | 'publish'
const STEPS: Step[] = ['photos', 'name', 'story', 'location', 'publish']

interface StepLayoutProps {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  actions: React.ReactNode
  stepIndex: number
  className?: string
}

function StepLayout({ title, description, children, actions, stepIndex, className }: StepLayoutProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="space-y-0.5 text-center pb-1.5">
        <h2 className="text-xl font-medium tracking-tight text-text-strong">{title}</h2>
        {description && <p className="text-sm text-text-weak">{description}</p>}
      </div>
      {children}
      <div className="flex flex-col gap-3 pt-2">{actions}</div>
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === stepIndex ? "w-6 bg-accent" : i < stepIndex ? "w-3 bg-accent/25" : "w-3 bg-background-weaker"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function AddForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('photos')
  const [photos, setPhotos] = useState<File[]>([])
  const [name, setName] = useState("")
  const [story, setStory] = useState("")
  const [location, setLocation] = useState<LocationValue | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const loading = loadingAction !== null
  const stepIndex = STEPS.indexOf(step)
  const next = () => setStep(STEPS[stepIndex + 1])
  const back = () => setStep(STEPS[stepIndex - 1])

  const backButton = stepIndex > 0 ? (
    <Button variant="ghost" className="w-full text-text-weak" onClick={back} disabled={loading}>
      Atrás
    </Button>
  ) : null

  const handleSubmit = async () => {
    if (!location) { toast.error("La ubicación es obligatoria"); return }
    setLoadingAction('submit')
    try {
      const supabase = createClient()
      const imageUrls: string[] = []

      if (photos.length > 0) {
        toast.loading("Subiendo fotos...", { id: "uploading" })
        const urls = await Promise.all(photos.map(async (file) => {
          const ext = file.name.split('.').pop()
          const path = `animitas/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
          const { error } = await supabase.storage.from('base').upload(path, file)
          if (error) throw new Error(`Error subiendo ${file.name}`)
          return supabase.storage.from('base').getPublicUrl(path).data.publicUrl
        }))
        imageUrls.push(...urls)
        toast.dismiss("uploading")
      }

      const res = await fetch('/api/heritage-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, story, isPublic, location, images: imageUrls })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Error al crear la animita')

      toast.success("¡Animita registrada!")
      router.push(`/animita/${data.slug}`)
    } catch (err: any) {
      toast.error(err.message || "Error al crear la animita")
    } finally {
      setLoadingAction(null)
    }
  }

  if (step === 'photos') {
    return (
      <StepLayout
        title="Añade fotos"
        description="Documentar visualmente la animita ayuda a preservarla."
        stepIndex={0}
        className="animate-fade-in"
        actions={<>
          <Button className="w-full" onClick={next}>Continuar</Button>
          <Button variant="ghost" className="w-full text-text-weak" onClick={next}>Omitir por ahora</Button>
        </>}
      >
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-background-weak border border-border-weak group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt="" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 5 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-28 border border-dashed border-border-weak rounded-md flex flex-col items-center justify-center bg-background-weak cursor-pointer hover:bg-background-weaker transition-colors text-text-weak hover:text-text gap-2"
          >
            <Camera className="size-5" />
            <span className="text-sm">Subir fotos ({photos.length}/5)</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (photos.length + files.length > 5) { toast.error("Máximo 5 imágenes"); return }
            setPhotos(prev => [...prev, ...files])
          }}
        />
      </StepLayout>
    )
  }

  if (step === 'name') {
    return (
      <StepLayout
        title="¿Cómo se llama?"
        description="El nombre de la persona o apodo de la animita."
        stepIndex={1}
        className="animate-slide-in-right"
        actions={<>
          <Button className="w-full" disabled={name.trim().length < 3} onClick={next}>Continuar</Button>
          {backButton}
        </>}
      >
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim().length >= 3) next() }}>
          <Input
            autoFocus
            placeholder="Ej: Animita de Romualdito"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </form>
      </StepLayout>
    )
  }

  if (step === 'story') {
    return (
      <StepLayout
        title="Su historia"
        description="Cuenta lo que sabes sobre esta animita."
        stepIndex={2}
        className="animate-slide-in-right"
        actions={<>
          <Button className="w-full" disabled={story.trim().length < 10} onClick={next}>Continuar</Button>
          {backButton}
        </>}
      >
        <Textarea
          autoFocus
          placeholder="Escribe la historia de esta animita..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </StepLayout>
    )
  }

  if (step === 'location') {
    return (
      <StepLayout
        title="¿Dónde está?"
        description="Marca la ubicación de la animita."
        stepIndex={3}
        className="animate-slide-in-right"
        actions={<>
          <Button className="w-full" disabled={!location} onClick={next}>Continuar</Button>
          {backButton}
        </>}
      >
        <LocationPicker value={location} onChange={setLocation} />
      </StepLayout>
    )
  }

  return (
    <StepLayout
      title="¿Lista para publicar?"
      description="Puedes cambiar la visibilidad cuando quieras."
      stepIndex={4}
      className="animate-slide-in-right"
      actions={<>
        <Button className="w-full" disabled={loading} onClick={handleSubmit}>
          {loadingAction === 'submit' ? <Spinner /> : "Publicar animita"}
        </Button>
        {backButton}
      </>}
    >
      <div className="flex items-center justify-between bg-background-weak p-4 rounded-lg border border-border-weak">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-text-strong">Visible para todos</p>
          <p className="text-xs text-text-weak">Cualquiera podrá encontrarla en el mapa</p>
        </div>
        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
      </div>
    </StepLayout>
  )
}
