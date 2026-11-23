import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteDetailView } from './sections/site-detail-view'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('heritage_sites')
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
  const supabase = await createClient()

  const { data: dbSiteRaw } = await supabase
    .from('heritage_sites')
    .select('*, user_profiles!creator_id(id, display_name)')
    .eq('slug', slug)
    .single()

  const site = dbSiteRaw ? {
    ...dbSiteRaw,
    created_by: {
      id: dbSiteRaw.user_profiles?.id || dbSiteRaw.creator_id || '',
      name: dbSiteRaw.user_profiles?.display_name || 'Anónimo'
    }
  } : null

  if (!site) {
    notFound()
  }

  return <SiteDetailView site={site} />
}
