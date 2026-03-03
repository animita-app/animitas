"use client"

import * as React from "react"
import { ImageGallery } from './image-gallery'
import { InfoSidebar } from './info-sidebar'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SiteDetailViewProps {
  site: any
}

export function SiteDetailView({ site }: SiteDetailViewProps) {
  return (
    <div className="flex flex-col md:flex-row h-svh w-full overflow-hidden">
      <Button
        size="sm"
        variant="ghost"
        className="!gap-1 text-text-weak md:bg-neutral-dark-6 md:hover:bg-neutral-dark-5 md:text-white md:hover:text-white border-0 h-8 [&_svg]:opacity-50 absolute top-4 left-4 !pl-1.5 z-10"
        asChild
      >
        <Link href="/">
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Link>
      </Button>

      <div className="bg-black flex-1 aspect-square md:aspect-auto w-full overflow-hidden relative flex items-center justify-center">
        <ImageGallery images={site.images} title={site.title} />
      </div>

      <InfoSidebar site={site} />
    </div>
  )
}
