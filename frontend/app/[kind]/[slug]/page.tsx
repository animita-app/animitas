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
    .select('title, city_region, heritage_kinds!kind_id(name), heritage_site_categories(heritage_categories(name))')
    .eq('slug', slug)
    .single()

  if (!data) {
    return {
      title: 'Sitio no encontrado',
      description: 'El sitio que buscas no existe.',
    }
  }

  const categoryNames = (data.heritage_site_categories as any[])?.map((c: any) => c.heritage_categories?.name).filter(Boolean) || []

  const keywords = [
    'animitas',
    'Chile',
    data.title,
    data.city_region,
    (data.heritage_kinds as any)?.[0]?.label || (data.heritage_kinds as any)?.label,
    ...categoryNames
  ].filter(Boolean)

  return {
    title: data.title,
    description: `Conoce más sobre ${data.title}${data.city_region ? ` en ${data.city_region}` : ''} en [ÁNIMA].`,
    keywords,
  }
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { slug } = await params
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

  console.log('Heritage site object:', site)

  return <SiteDetailView site={site} />
}
