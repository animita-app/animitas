'use client'
import { useMemo, useState } from 'react'
import { useAnimitas } from '@/contexts/animitas-context'
import { AnimitaCard } from '@/components/animita/animita-card'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/empty-state'

type SortOrder = 'newest' | 'oldest' | 'name'

export default function ListPage() {
  const { animitas, selectedComunas } = useAnimitas()
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const sortedSites = useMemo(() => {
    const sites = [...animitas]
    switch (sortOrder) {
      case 'oldest':
        return sites.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      case 'name':
        return sites.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      case 'newest':
      default:
        return sites.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }
  }, [animitas, sortOrder])

  const gridKey = useMemo(() => {
    const parts = [
      selectedComunas.join(','),
      sortOrder
    ].filter(Boolean)
    return parts.join('-') || 'all'
  }, [selectedComunas, sortOrder])

  return (
    <div className="min-h-svh w-full bg-background py-20">
      <div className="px-4 mx-auto">
        {sortedSites.length > 0 ? (
          <>
            <div className="sr-only mb-6">
              <p className="text-sm text-text-weak">
                {sortedSites.length} {sortedSites.length === 1 ? 'animita' : 'animitas'}
              </p>
            </div>

            <div
              key={gridKey}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
            >
              {sortedSites.map((site, index) => (
                <div
                  key={site.id}
                  className={cn(
                    "animate-in fade-in zoom-in-95 [animation-fill-mode:both]",
                    // "group-hover:scale-[97%] hover:scale-100",
                    "transition-all duration-200 ease-out-expo"
                  )}
                  style={{
                    animationDelay: `${Math.min(index * 40, 400)}ms`
                  }}
                >
                  <AnimitaCard site={site} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState title="No hay animitas en esas comunas" description="Prueba con otra comuna o limpia el filtro." />
        )}
      </div>
    </div>
  )
}
