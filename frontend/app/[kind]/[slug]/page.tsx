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
  const { slug, kind } = await params

  const site = SEED_HERITAGE_SITES.find((s) => s.slug === slug)

  if (!site) {
    notFound()
  }

  // Validate that the kind matches (case-insensitive)
  const siteKind = ((site as any).kind || 'animita').toLowerCase()
  if (kind.toLowerCase() !== siteKind) {
    notFound()
  }

  return (
    <div className="flex flex-col md:flex-row h-svh w-full overflow-hidden">
      <Button size="sm" className="text-muted-foreground md:bg-neutral-800 md:hover:bg-neutral-800/80 md:text-white md:hover:text-white border-0 h-8 [&_svg]:opacity-50 absolute top-4 left-4 !pl-1.5 gap-1.5 z-10" variant="ghost" asChild>
        <Link href="/">
          <ChevronLeft />
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
