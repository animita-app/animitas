'use client'

import { useEffect, useState } from 'react'
import type { Animita } from '@/types/animita'
import { toAnimita } from '@/lib/animitas'
import { loadDemo } from '@/lib/demo/store'
import { DEMO_USER } from '@/lib/demo/flag'
import { AnimitaSheet } from '@/components/animita/animita-sheet'
import { SiteDetailView } from '@/app/animita/[slug]/sections/site-detail-view'
import { EmptyState } from '@/components/empty-state'

// An animita added in demo mode lives only in this browser, so its page is put together here.
export function DemoAnimita({ slug, as }: { slug: string; as: 'page' | 'sheet' }) {
  const [site, setSite] = useState<Animita | null | undefined>(undefined)
  useEffect(() => {
    const row = loadDemo().animitas.find(a => a.slug === slug)
    setSite(row ? toAnimita({ ...row, user_profiles: { id: DEMO_USER.id, display_name: DEMO_USER.display_name } }) : null)
  }, [slug])

  if (site === undefined) return null
  if (!site) return <EmptyState title="No encontramos esta animita" cutout="por aquí no es" />
  return as === 'sheet' ? <AnimitaSheet key={site.id} site={site} /> : <SiteDetailView key={site.id} site={site} />
}
