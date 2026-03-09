"use client"

import * as React from "react"
import { ImageGallery } from './image-gallery'
import { InfoSidebar } from './info-sidebar'
import { GalleryHeader } from './gallery-header'
import { SiteEditingProvider } from './site-edit-context'

import { ImageGalleryEditorWrapper } from './image-gallery-editor'

interface SiteDetailViewProps {
  site: any
}

export function SiteDetailView({ site }: SiteDetailViewProps) {
  const [previewImages, setPreviewImages] = React.useState<string[]>(site.images || [])
  const [isGalleryEditorOpen, setIsGalleryEditorOpen] = React.useState(false)

  return (
    <SiteEditingProvider>
      <div className="flex flex-col md:flex-row h-svh w-full overflow-hidden">
        <div className="bg-black flex-1 aspect-square md:aspect-auto w-full overflow-hidden relative flex items-center justify-center">
          <GalleryHeader site={site} onEditGallery={() => setIsGalleryEditorOpen(true)} />
          <ImageGalleryEditorWrapper
            site={site}
            onPreviewImagesChange={setPreviewImages}
            isOpen={isGalleryEditorOpen}
            onOpenChange={setIsGalleryEditorOpen}
          >
            <ImageGallery site={site} images={previewImages} title={site.title} />
          </ImageGalleryEditorWrapper>
        </div>

        <InfoSidebar site={site} />
      </div>
    </SiteEditingProvider>
  )
}
