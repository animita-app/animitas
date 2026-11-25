export interface Animita {
  id: string
  slug: string
  title: string
  story?: string
  location: { lat: number; lng: number }
  address?: string | null
  city_region?: string | null
  images: string[] | null
  status?: 'draft' | 'published' | 'flagged'
  created_at: string
  created_by: { id: string; name: string }
  creator_id: string
}
