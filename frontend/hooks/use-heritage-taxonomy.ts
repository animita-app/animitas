import { useEffect, useState } from 'react'
import { HeritageCategory, HeritageKind } from '@/types/heritage'
import { createClient } from '@/lib/supabase/client'

export function useHeritageTaxonomy() {
  const [categories, setCategories] = useState<HeritageCategory[]>([])
  const [kinds, setKinds] = useState<HeritageKind[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const supabase = createClient()

        const [{ data: categoriesData, error: catError }, { data: kindsData, error: kindError }] = await Promise.all([
          supabase.from('heritage_categories').select('*').order('sort_order'),
          supabase.from('heritage_kinds').select('*').eq('enabled', true).order('sort_order')
        ])

        if (catError) {
          console.error('[Taxonomy] Categories error:', catError)
        } else {
          // console.log('[Taxonomy] Fetched categories:', categoriesData?.length || 0)
          setCategories(categoriesData || [])
        }

        if (kindError) {
          console.error('[Taxonomy] Kinds error:', kindError)
        } else {
          // console.log('[Taxonomy] Fetched kinds:', kindsData?.length || 0)
          setKinds(kindsData || [])
        }
      } catch (error) {
        console.error('[Taxonomy] Fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaxonomy()
  }, [])

  return { categories, kinds, isLoading }
}
