"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Animita } from "@/types/animita"
import { useUser } from "@/contexts/user-context"
import { TABLES } from "@/lib/animitas"
import { uploadAnimitaPhoto } from "@/lib/photos"

const MAX_PHOTOS = 5

type ImageItem = {
  id: string
  url: string
  file?: File
}

function SortableImageItem({ id, url, onRemove }: { id: string; url: string; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="relative aspect-square rounded-md overflow-hidden bg-background-weak group cursor-grab active:cursor-grabbing data-[dragging=true]:opacity-50 data-[dragging=true]:ring-2 data-[dragging=true]:ring-accent"
      data-dragging={isDragging}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="object-cover size-full pointer-events-none" />
      <Button
        type="button"
        size="icon-xs"
        variant="secondary"
        aria-label="Quitar foto"
        className="absolute top-1 right-1"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
        }}
      >
        <X />
      </Button>
    </div>
  )
}

interface ImageGalleryEditorProps {
  site: Animita
  children: React.ReactNode
  images: string[]
  onImagesSaved: (images: string[]) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageGalleryEditorWrapper({ site, children, images, onImagesSaved, isOpen, onOpenChange }: ImageGalleryEditorProps) {
  const { currentUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<ImageItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setItems(images.map((url, i) => ({ id: `img-${i}-${url}`, url })))
    }
  }, [isOpen, images])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex(i => i.id === active.id)
        const newIndex = prev.findIndex(i => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (items.length + files.length > MAX_PHOTOS) {
      toast.error(`Puedes tener hasta ${MAX_PHOTOS} fotos`)
      return
    }
    setItems(prev => [
      ...prev,
      ...files.map(file => ({ id: `new-${Date.now()}-${file.name}`, url: URL.createObjectURL(file), file })),
    ])
  }

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error("Deja al menos una foto")
      return
    }
    setIsSaving(true)
    const supabase = createClient()
    try {
      const urls = await Promise.all(items.map(item =>
        item.file ? uploadAnimitaPhoto(supabase, currentUser!.id, item.file) : item.url
      ))

      const { error } = await supabase.from(TABLES.animitas).update({ images: urls }).eq('id', site.id)
      if (error) throw error

      onImagesSaved(urls)
      onOpenChange(false)
      toast.success(urls.length === 1 ? "1 foto guardada" : `${urls.length} fotos guardadas`)
    } catch (err: any) {
      toast.error("No se pudieron guardar las fotos", {
        description: err?.message,
        action: { label: "Reintentar", onClick: handleSave },
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="relative size-full">{children}</div>

      <Dialog open={isOpen} onOpenChange={(open) => !isSaving && onOpenChange(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fotos</DialogTitle>
            <DialogDescription>Arrastra para cambiar el orden. La primera es la portada.</DialogDescription>
          </DialogHeader>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-2">
              <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                {items.map((item) => (
                  <SortableImageItem
                    key={item.id}
                    id={item.id}
                    url={item.url}
                    onRemove={(id) => setItems(prev => prev.filter(i => i.id !== id))}
                  />
                ))}
              </SortableContext>

              {items.length < MAX_PHOTOS && (
                <Button
                  type="button"
                  variant="secondary"
                  aria-label="Añadir fotos"
                  className="aspect-square h-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus />
                </Button>
              )}
            </div>
          </DndContext>
          <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleAddFiles} />

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Spinner />}
              {isSaving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
