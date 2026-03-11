"use client"

import React, { useState, useRef, useEffect } from "react"
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
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { HeritageSite } from "@/types/heritage"
import { useUser } from "@/contexts/user-context"
import { useSiteEditing } from "./site-edit-context"

// --- SORTABLE ITEM COMPONENT ---
function SortableImageItem({
  id,
  url,
  onRemove
}: {
  id: string
  url: string
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-square rounded-md overflow-hidden bg-background-weak border border-border-weak group cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-lg ring-2 ring-accent' : ''
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="object-cover w-full h-full pointer-events-none" />

      <button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation() // Prevent dragging when clicking delete
        }}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
        }}
        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

// --- MAIN WRAPPER COMPONENT ---
interface ImageGalleryEditorProps {
  site: HeritageSite
  children: React.ReactNode
  onPreviewImagesChange: (images: string[]) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

type ImageItem = {
  id: string
  url: string
  file?: File
}

export function ImageGalleryEditorWrapper({
  site,
  children,
  onPreviewImagesChange,
  isOpen: externalOpen,
  onOpenChange: setExternalOpen
}: ImageGalleryEditorProps) {
  const { currentUser } = useUser()
  const { setIsEditing, confirmToken, cancelToken, updateStagedChange } = useSiteEditing()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen
  const setIsOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen

  // The items being edited right now inside the dialog
  const [dialogItems, setDialogItems] = useState<ImageItem[]>([])

  // The pending accepted items (staged for global "Confirmar")
  const [stagedItems, setStagedItems] = useState<ImageItem[] | null>(null)

  const [isUploading, setIsUploading] = useState(false)

  // Load initial images when dialog opens
  useEffect(() => {
    if (isOpen) {
      const startingItems = stagedItems || (site.images || []).map((url, i) => ({ id: `img-${i}-${Date.now()}`, url }))
      setDialogItems(startingItems)
    }
  }, [isOpen, site.images, stagedItems])

  // Sync staging when tokens change
  useEffect(() => {
    if (cancelToken > 0) {
      setStagedItems(null)
      onPreviewImagesChange(site.images || [])
    }
  }, [cancelToken, site.images, onPreviewImagesChange])

  const uploadNewImages = async (items: ImageItem[]) => {
    const supabase = createClient()
    return Promise.all(items.map(async (item) => {
      if (item.file) {
        const ext = item.file.name.split('.').pop()
        const path = `users/${currentUser?.id}/animitas/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { error } = await supabase.storage.from('base').upload(path, item.file)
        if (error) throw new Error(`Error subiendo foto`)
        return supabase.storage.from('base').getPublicUrl(path).data.publicUrl
      }
      return item.url
    }))
  }

  // EFFECT: Handle Global Confirm
  useEffect(() => {
    if (confirmToken > 0 && stagedItems !== null) {
      const commitChanges = async () => {
        setIsUploading(true)
        toast.loading("Procesando imágenes...", { id: "saving-images" })

        try {
          const finalUrls = await uploadNewImages(stagedItems)
          updateStagedChange('images', finalUrls)
          toast.success("Imágenes listas para guardar", { id: "saving-images" })
          setStagedItems(null)
        } catch (err: any) {
          toast.error("Error al procesar imágenes", { id: "saving-images" })
          console.error(err)
        } finally {
          setIsUploading(false)
        }
      }

      commitChanges()
    }
  }, [confirmToken, stagedItems, currentUser?.id, updateStagedChange])

  // Handle DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setDialogItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: `new-${Date.now()}-${file.name}`,
        url: URL.createObjectURL(file), // Temp local URL for preview
        file
      }))
      setDialogItems(prev => [...prev, ...newFiles])
    }
  }

  const handleRemove = (id: string) => {
    setDialogItems(prev => prev.filter(i => i.id !== id))
  }

  const handleApplyChanges = () => {
    // Stage items
    setStagedItems(dialogItems)
    onPreviewImagesChange(dialogItems.map(i => i.url))
    setIsEditing(true)
    setIsOpen(false)
  }

  return (
    <>
      <div className="relative w-full h-full group">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader className="sr-only">
            <DialogTitle>Editar Galería</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-3 gap-3">
                <SortableContext
                  items={dialogItems.map(i => i.id)}
                  strategy={rectSortingStrategy}
                >
                  {dialogItems.map((item) => (
                    <SortableImageItem
                      key={item.id}
                      id={item.id}
                      url={item.url}
                      onRemove={handleRemove}
                    />
                  ))}
                </SortableContext>

                {/* Add new image button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer relative aspect-square rounded-md overflow-hidden bg-background-weak border group"
                >
                  <Plus className="size-8 text-text-weak" />
                  <span className="sr-only text-xs text-text-weak font-medium mt-1">Añadir</span>
                </button>
              </div>
            </DndContext>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleAddFiles}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyChanges} disabled={isUploading}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
