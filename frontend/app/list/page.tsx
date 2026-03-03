'use client'
import { useMemo, useState } from 'react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { HeritageSiteCard } from '@/components/cards/heritage-site-card'

type SortOrder = 'newest' | 'oldest' | 'name'

export default function ListPage() {
  const { filteredData, filters } = useSpatialContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const activeCategory = (filters.category || [])[0] || null
  const activeKind = (filters.kind || [])[0] || null
  const activeCity = (filters.city_region || [])[0] || null

  const sortedSites = useMemo(() => {
    const sites = [...filteredData]
    switch (sortOrder) {
      case 'oldest':
        return sites.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      case 'name':
        return sites.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      case 'newest':
      default:
        return sites.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }
  }, [filteredData, sortOrder])

  const gridKey = useMemo(() => {
    const parts = [activeCategory, activeKind, activeCity, sortOrder].filter(Boolean)
    return parts.join('-') || 'all'
  }, [activeCategory, activeKind, activeCity, sortOrder])

  return (
    <div className="min-h-svh w-full bg-background py-20">
      <div className="max-w-6xl mx-auto">
        {sortedSites.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-text-weak">
                {sortedSites.length} {sortedSites.length === 1 ? 'sitio' : 'sitios'} encontrado{sortedSites.length === 1 ? '' : 's'}
              </p>
            </div>

            <div
              key={gridKey}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {sortedSites.map((site, index) => (
                <div
                  key={site.id}
                  className="animate-in fade-in zoom-in-95 [animation-fill-mode:both]"
                  style={{
                    animationDelay: `${Math.min(index * 40, 400)}ms`
                  }}
                >
                  <HeritageSiteCard site={site} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-text-weak">No hay sitios que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
