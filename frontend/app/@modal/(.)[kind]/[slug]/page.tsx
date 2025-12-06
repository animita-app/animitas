import { ModalWrapper } from '@/components/modal/modal-wrapper'
import { SEED_HERITAGE_SITES } from '@/constants/heritage-sites'
import { notFound } from 'next/navigation'
import { ImageGallery } from '@/app/[kind]/[slug]/sections/image-gallery'
import { InfoSidebar } from '@/app/[kind]/[slug]/sections/info-sidebar'
import { HeritageSite } from '@/types/mock'

interface PageProps {
  params: Promise<{
    kind: string
    slug: string
  }>
}

export default async function InterceptedSiteDetailPage({ params }: PageProps) {
  const { slug } = await params
  const site = SEED_HERITAGE_SITES.find((s) => s.slug === slug)

  if (!site) {
    notFound()
  }

  return (
    <ModalWrapper
      title={site.title}
      description={`Detalle de ${site.title}`}
      showTitle={false}
      className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto h-auto gap-0"
    >
      <div className="flex h-[90vh] w-[90vw] max-w-6xl overflow-hidden bg-background rounded-lg shadow-xl">
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/5">
          <ImageGallery images={site.images} title={site.title} />
        </div>
        <div className="w-[400px] border-l border-border h-full overflow-y-auto bg-background">
          <InfoSidebar site={site} />
        </div>
      </div>
    </ModalWrapper>
  )
}
