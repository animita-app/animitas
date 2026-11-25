import { notFound } from 'next/navigation'
import { getAnimita } from '@/lib/animitas-server'
import { isDemoServer } from '@/lib/demo/server'
import { DemoAnimita } from '@/components/animita/demo-animita'
import { AnimitaSheet } from '@/components/animita/animita-sheet'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AnimitaSheetPage({ params }: PageProps) {
  const { slug } = await params
  const site = await getAnimita(slug)
  if (!site) {
    if (await isDemoServer()) return <DemoAnimita slug={slug} as="sheet" />
    notFound()
  }
  return <AnimitaSheet key={site.id} site={site} />
}
