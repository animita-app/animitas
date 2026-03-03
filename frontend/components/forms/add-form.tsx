"use client"

import * as React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageIcon, MapPin, X, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { StoryHighlights, Highlight, HighlightCategory } from "@/components/ui/story-highlights"
import { LocationPicker } from "@/app/add/location-picker"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"

type LocationValue = { lat: number; lng: number; address: string; cityRegion: string }

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

const KINDS = [
  { label: "Animita", value: "Animita", enabled: true },
  { label: "Gruta", value: "Gruta", enabled: false },
  { label: "Mausoleo", value: "Mausoleo", enabled: false },
  { label: "Placa", value: "Placa", enabled: false },
]

interface AddFormProps {
  onCancel?: () => void
}

export function AddForm({ onCancel }: AddFormProps) {
  const router = useRouter()
  const { currentUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [kind, setKind] = useState("Animita")
  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [location, setLocation] = useState<LocationValue | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedHighlights, setScannedHighlights] = useState<Highlight[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = title.trim().length > 0 && photos.length >= 1 && !!location && !isScanning && !isSubmitting

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: "Ubicación detectada",
            cityRegion: "Cerca de ti",
          })
        },
        () => {}
      )
    }
  }, [])

  const handleCancel = () => {
    if (onCancel) onCancel()
    else router.back()
  }

  const handleSubmit = async () => {
    if (!location) { toast.error("La ubicación es obligatoria"); return }
    if (photos.length === 0) { toast.error("Agrega al menos una foto"); return }

    const highlights = detectHighlights(story)
    setIsScanning(true)
    setScannedHighlights([])

    for (let i = 0; i < highlights.length; i++) {
      await new Promise(r => setTimeout(r, 250))
      setScannedHighlights(prev => [...prev, highlights[i]])
    }

    await new Promise(r => setTimeout(r, highlights.length > 0 ? 700 : 400))
    setIsScanning(false)
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const imageUrls: string[] = []

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

      const res = await fetch('/api/heritage-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: title, story, isPublic: true, location, images: imageUrls })
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
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-weak shrink-0">
        <Button variant="ghost" size="sm" className="text-text-weak" onClick={handleCancel}>
          Cancelar
        </Button>
        <span className="text-sm font-medium text-text-strong">Crea una entrada</span>
        <div className="w-[68px]" />
      </div>

      {/* Kind badge */}
      <div className="px-4 pt-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge variant="outline" className="cursor-pointer gap-1 font-normal select-none">
              {kind}
              <ChevronDown className="size-3" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {KINDS.map(k => (
              <DropdownMenuItem
                key={k.value}
                disabled={!k.enabled}
                onSelect={() => setKind(k.value)}
                className={cn(kind === k.value && "font-medium")}
              >
                {k.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-3 px-4 pt-3 overflow-y-auto min-h-0">
        <Avatar className="size-8 shrink-0 mt-0.5">
          <AvatarImage src={currentUser?.avatarUrl} />
          <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() ?? "A"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-2 pb-4">
          <Input
            autoFocus
            placeholder="¿A quién recordamos?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border-none shadow-none p-0 h-auto text-base font-medium placeholder:text-text-weaker focus-visible:ring-0"
          />

          {isScanning ? (
            <div className="text-sm text-text leading-relaxed">
              <StoryHighlights text={story} highlights={scannedHighlights} />
            </div>
          ) : (
            <Textarea
              placeholder="¿Cuál es su historia?"
              value={story}
              onChange={e => setStory(e.target.value)}
              className="border-none shadow-none p-0 resize-none text-sm placeholder:text-text-weaker focus-visible:ring-0 min-h-[120px]"
            />
          )}

          {/* Photo thumbnails */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {photos.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-background-weak border border-border-weak group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Location chip */}
          {location && !showLocationPicker && (
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-1.5 text-xs text-accent font-medium w-fit"
            >
              <MapPin className="size-3" />
              {location.cityRegion}
            </button>
          )}

          {/* Inline location picker */}
          {showLocationPicker && (
            <div className="pt-1">
              <LocationPicker
                value={location}
                onChange={(val) => {
                  setLocation(val)
                  if (val) setShowLocationPicker(false)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="border-t border-border-weak px-3 py-2 flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", photos.length > 0 && "text-accent")}
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning || isSubmitting}
        >
          <ImageIcon />
          {photos.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-medium">
              {photos.length}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(location && "text-accent")}
          onClick={() => setShowLocationPicker(v => !v)}
          disabled={isScanning || isSubmitting}
        >
          <MapPin />
        </Button>

        <Button variant="ghost" size="icon" disabled className="text-text-weaker">
          <User />
        </Button>

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
