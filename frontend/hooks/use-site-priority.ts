import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSitePriority, SitePriority } from '@/lib/site-priority'

export function useSitePriority(siteId: string) {
  const [priority, setPriority] = useState<SitePriority>('ok')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!siteId) {
      setIsLoading(false)
      return
    }
    const supabase = createClient()
    supabase
      .from('heritage_site_votes')
      .select('option')
      .eq('site_id', siteId)
      .then(({ data }) => {
        if (data) {
          const counts: Record<string, number> = {}
          data.forEach(({ option }: { option: string }) => {
            counts[option] = (counts[option] ?? 0) + 1
          })
          setPriority(getSitePriority(counts))
        }
        setIsLoading(false)
      })
  }, [siteId])

  return { priority, isLoading }
}
