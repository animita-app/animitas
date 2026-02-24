/**
 * Demo Mode - Specific Heritage Site Detail
 *
 * Shows the detail page for Hermógenes San Martín (rich content example)
 */

'use client'

import { UserProvider } from '@/contexts/user-context'
import { SpatialProvider } from '@/contexts/spatial-context'
import { SiteDetailView } from '@/app/[kind]/[slug]/sections/site-detail-view'
import { SEED_HERITAGE_SITES } from '@/constants/heritage-sites'

export default function HermogenesDetailPage() {
  // Find the specific site from SEED
  const site = SEED_HERITAGE_SITES.find(s => s.slug === 'animita-de-hermogenes-san-martin')

  if (!site) return <div>No se encontró la animita</div>

  return (
    <UserProvider>
      <SpatialProvider>
        <div className="w-full h-full overflow-y-auto">
          <SiteDetailView site={site} />
        </div>
      </SpatialProvider>
    </UserProvider>
  )
}
