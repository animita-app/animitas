import { notFound } from 'next/navigation'
import { SEED_HERITAGE_SITES } from '@/constants/heritage-sites'
import { createClient } from '@/lib/supabase/server'
import { SiteDetailView } from './sections/site-detail-view'

interface PageProps {
  params: Promise<{
    kind: string
    slug: string
  }>
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { slug, kind } = await params
  const supabase = await createClient()

  // 1. Try fetching from Supabase
  const { data: dbSite } = await supabase
    .from('heritage_sites')
    .select('*')
    .eq('slug', slug)
    .single()

  // 2. Fallback to SEED
  const seedSite = SEED_HERITAGE_SITES.find((s) => s.slug === slug)
  const site = dbSite || seedSite

  if (!site) {
    notFound()
  }

  return <SiteDetailView site={site} />
}
