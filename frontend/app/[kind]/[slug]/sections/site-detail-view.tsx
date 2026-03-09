"use client"

import * as React from "react"
import { ImageGallery } from './image-gallery'
import { InfoSidebar } from './info-sidebar'
import { GalleryHeader } from './gallery-header'
import { SiteEditingProvider } from './site-edit-context'

interface SiteDetailViewProps {
  site: any
}

export function SiteDetailView({ site }: SiteDetailViewProps) {
  return (
    <SiteEditingProvider>
      <div className="flex flex-col md:flex-row h-svh w-full overflow-hidden">
        <div className="bg-black flex-1 aspect-square md:aspect-auto w-full overflow-hidden relative flex items-center justify-center">
          <GalleryHeader site={site} />
          <ImageGallery site={site} images={site.images} title={site.title} />
        </div>

        <InfoSidebar site={site} />
      </div>
    </SiteEditingProvider>
  )
}
