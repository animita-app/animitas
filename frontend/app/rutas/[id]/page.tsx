import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RouteView } from './route-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('site_routes')
    .select('title, description')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Ruta' }

  return {
    title: data.title,
    description: data.description || 'Una ruta en Animita'
  }
}

export default async function RoutePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: route } = await supabase
    .from('site_routes')
    .select(
      `id,
       title,
       description,
       creator_id,
       created_at,
       site_route_items(
         sort_order,
         heritage_sites(
           id,
           slug,
           title,
           images,
           city_region,
           heritage_kinds!kind_id(slug)
         )
       )`,
      { count: 'exact' }
    )
    .eq('id', id)
    .order('sort_order', { foreignTable: 'site_route_items', ascending: true })
    .single()

  const { data: creator } = route?.creator_id
    ? await supabase
        .from('user_profiles')
        .select('display_name, username, image')
        .eq('id', route.creator_id)
        .single()
    : { data: null }

  return <RouteView route={route as any} creator={creator} />
}
