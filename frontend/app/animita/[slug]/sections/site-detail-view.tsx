"use client"

import * as React from "react"
import Link from "next/link"
import { ImagePlus } from "lucide-react"
import { CurveSign } from "@/components/road-signs"
import { CutoutText } from "@/components/cutout-text"
import { PrintWall } from "@/components/animita/loose-prints"
import { useUser } from "@/contexts/user-context"
import { canEditAnimita } from "@/lib/animitas"
import { AnimitaDetails } from "./animita-details"
import { ImageGalleryEditorWrapper } from "./image-gallery-editor"

interface SiteDetailViewProps {
  site: any
}

// The animita on its own page: the same loose prints and story as the panel over the map, on paper.
export function SiteDetailView({ site }: SiteDetailViewProps) {
  const { currentUser, isEditor } = useUser()
  const [images, setImages] = React.useState<string[]>(site.images || [])
  const [isGalleryEditorOpen, setIsGalleryEditorOpen] = React.useState(false)
  const canEdit = canEditAnimita(currentUser, isEditor, site)

  return (
    <div className="min-h-svh w-full bg-background">
      {/* The same pattern as the key: it grows out of its corner and its name falls in an arc toward the page. */}
      <div className="shelf shelf-top fixed top-3 left-3 z-40">
        <Link href="/map" aria-label="Volver al mapa" style={{ transformOrigin: '0 0' }} className="shelf-item relative flex rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="shelf-label pointer-events-none absolute left-1/2 top-1/2 z-10 size-0">
            <CutoutText text="volver" height={26} orbit={{ radius: 100, angle: 55, clockwise: false }} />
          </span>
          <CurveSign className="size-12" />
        </Link>
      </div>

      <main className="mx-auto grid max-w-6xl gap-12 px-6 pt-24 pb-32 md:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] md:gap-16">
        <div className="relative md:sticky md:top-24 md:self-start">
          <ImageGalleryEditorWrapper
            site={site}
            images={images}
            onImagesSaved={setImages}
            isOpen={isGalleryEditorOpen}
            onOpenChange={setIsGalleryEditorOpen}
          >
            <PrintWall site={{ ...site, images }} />
          </ImageGalleryEditorWrapper>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsGalleryEditorOpen(true)}
              aria-label="Editar fotos"
              className="group absolute -bottom-10 left-0 flex items-center gap-2 rounded-md text-text-weak outline-none hover:text-text-strong focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <ImagePlus />
              <span className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <CutoutText text="fotos" height={16} />
              </span>
            </button>
          )}
        </div>
        <AnimitaDetails site={{ ...site, images }} />
      </main>
    </div>
  )
}
