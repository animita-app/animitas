import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteDetailView } from './sections/site-detail-view'

interface PageProps {
  params: Promise<{
    kind: string
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('heritage_sites')
    .select('title, heritage_kinds!kind_id(slug)')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Animita' }

  const kindSlug = (data as any).heritage_kinds?.slug ?? 'animita'
  const displayTitle = kindSlug === 'animita' ? `Animita de ${data.title}` : data.title

  return {
    title: displayTitle,
    description: `Conoce la historia de ${displayTitle} en Animitas.`,
  }
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { slug, kind } = await params
  const supabase = await createClient()

  // Fetch from Supabase
  const { data: dbSiteRaw } = await supabase
    .from('heritage_sites')
    .select('*, user_profiles!creator_id(id, display_name), heritage_kinds!kind_id(slug, name)')
    .eq('slug', slug)
    .single()

  // Transform to match HeritageSite type
  const site = dbSiteRaw ? {
    ...dbSiteRaw,
    kind: dbSiteRaw.heritage_kinds?.slug,
    created_by: {
      id: dbSiteRaw.user_profiles?.id || dbSiteRaw.creator_id || '',
      name: dbSiteRaw.user_profiles?.display_name || 'Anonymous'
    }
  } : null

  if (!site) {
    notFound()
  }

  return <SiteDetailView site={site} />
}
