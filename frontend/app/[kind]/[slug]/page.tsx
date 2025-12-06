import React from 'react'
import { notFound } from 'next/navigation'
import { SEED_HERITAGE_SITES } from '@/constants/heritage-sites'
import { ImageGallery } from './sections/image-gallery'
import { InfoSidebar } from './sections/info-sidebar'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    kind: string
    slug: string
  }>
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { slug } = await params

  const site = SEED_HERITAGE_SITES.find((s) => s.slug === slug)

  if (!site) {
    notFound()
  }

  return (
    <div className="flex h-svh w-full overflow-hidden">
      <Button size="sm" className="h-8 [&_svg]:opacity-50 absolute top-4 left-4 !pl-1.5 gap-1.5 bg-neutral-800 border-0 hover:bg-neutral-800/80 text-white hover:text-white z-10" variant="outline" asChild>
        <Link href="/map">
          <ChevronLeft />
          Volver
        </Link>
      </Button>

      <div className="flex-1 overflow-hidden relative flex items-center justify-center">
        <ImageGallery images={site.images} title={site.title} />
      </div>

      <InfoSidebar site={site} />
    </div>
  )
}
