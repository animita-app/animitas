"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MapPin, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { LocationSelector, type Location } from "@/components/search/location-selector"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { useLocationSearch } from "@/hooks/use-location-search"
import { cn } from "@/lib/utils"
import { animitaHref } from "@/lib/routes"

function truncateAddress(address: string): string {
  const parts = address.split(',')
  if (parts.length > 2) {
    return `${parts[0]}, ${parts[1]}`
  }
  return address
}

interface AddFormProps {
  onCancel?: () => void
}

export function AddForm({ onCancel }: AddFormProps) {
  const router = useRouter()
  const { currentUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [location, setLocation] = useState<Location[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isLoading: isSearchingLocation, searchResults: locationResults, handleSearch: handleLocationSearch } = useLocationSearch()

  const canSubmit = title.trim().length > 0 && photos.length >= 1 && location.length > 0 && !isSubmitting


  const handleCancel = () => {
    if (onCancel) onCancel()
    else router.back()
  }

  const handleSubmit = async () => {
    if (location.length === 0) { toast.error("La ubicación es obligatoria"); return }
    if (photos.length === 0) { toast.error("Agrega al menos una foto"); return }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const imageUrls: string[] = []

      toast.loading("Subiendo fotos…", { id: "uploading" })
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
          location: location[0],
          images: imageUrls,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Error al crear la animita')

      toast.success("¡Animita registrada!")
      router.push(animitaHref(data.slug))
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

            <Input
              autoFocus
              placeholder="¿A quién recordamos?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-lg md:text-lg font-semibold bg-transparent border-none shadow-none resize-none focus-visible:ring-0 shrink-0"
            />

            <Textarea
              placeholder="¿Cuál es su historia?"
              value={story}
              onChange={e => setStory(e.target.value)}
              className="bg-transparent border-none shadow-none resize-none focus-visible:ring-0"
            />
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
