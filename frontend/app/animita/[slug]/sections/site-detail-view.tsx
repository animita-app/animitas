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
      <div className="flex flex-col md:flex-row md:h-svh w-full md:overflow-hidden">
        <div className="bg-black shrink-0 flex-none md:flex-1 md:min-w-0 aspect-square md:aspect-auto w-full relative">
          <GalleryHeader site={site} onEditGallery={() => setIsGalleryEditorOpen(true)} />
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            <ImageGalleryEditorWrapper
              site={site}
              onPreviewImagesChange={setPreviewImages}
              isOpen={isGalleryEditorOpen}
              onOpenChange={setIsGalleryEditorOpen}
            >
              <ImageGallery site={site} images={previewImages} title={site.title} />
            </ImageGalleryEditorWrapper>
          </div>
        </div>

        <InfoSidebar site={site} />
      </div>
    </SiteEditingProvider>
  )
}
