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
        } else {
          setCategories(categoriesData || [])
        }

        if (kindError) {
        } else {
          setKinds(kindsData || [])
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaxonomy()
  }, [])

  return { categories, kinds, isLoading }
}
