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

  return {
    title: data?.title,
    description: `Conoce más sobre ${data?.title} en [ÁNIMA].`,
  }
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { slug, kind } = await params
  const supabase = await createClient()

  // Fetch from Supabase
  const { data: dbSiteRaw } = await supabase
    .from('heritage_sites')
    .select('*, user_profiles!creator_id(id, display_name), heritage_kinds!kind_id(*, heritage_categories(*)), heritage_site_categories(heritage_categories(*))')
    .eq('slug', slug)
    .single()

  // Transform to match HeritageSite type
  // @ts-ignore
  const site = dbSiteRaw ? {
    ...dbSiteRaw,
    kind: dbSiteRaw.heritage_kinds ? {
      ...dbSiteRaw.heritage_kinds,
      category: (dbSiteRaw.heritage_kinds as any).heritage_categories
    } : null,
    categories: (dbSiteRaw.heritage_site_categories as any[])?.map((c: any) => c.heritage_categories).filter(Boolean) || [],
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
