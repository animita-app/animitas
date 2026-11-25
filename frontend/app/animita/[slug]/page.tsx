import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAnimita } from '@/lib/animitas-server'
import { SiteDetailView } from './sections/site-detail-view'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const animita = await getAnimita(slug)
  if (!animita) return { title: 'Animita no encontrada' }

  return {
    title: `Animita de ${animita.title}`,
    description: animita.story?.slice(0, 160) || `La historia de la animita de ${animita.title}.`,
  }
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { slug } = await params
  const site = await getAnimita(slug)

  if (!site) {
    notFound()
  }

  return <SiteDetailView key={site.id} site={site} />
}
