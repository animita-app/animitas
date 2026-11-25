import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAnimita } from '@/lib/animitas-server'
import { SiteDetailView } from './sections/site-detail-view'
import { TABLES } from '@/lib/animitas'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from(TABLES.animitas)
    .select('title')
    .eq('slug', slug)
    .single()

  return {
    title: data?.title,
    description: `La historia de la animita ${data?.title}.`,
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
