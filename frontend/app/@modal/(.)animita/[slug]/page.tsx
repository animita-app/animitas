import { notFound } from 'next/navigation'
import { getAnimita } from '@/lib/animitas'
import { AnimitaSheet } from '@/components/animita/animita-sheet'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AnimitaSheetPage({ params }: PageProps) {
  const { slug } = await params
  const site = await getAnimita(slug)
  if (!site) notFound()
  return <AnimitaSheet key={site.id} site={site} />
}
