'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAnimitas } from '@/contexts/animitas-context'
import { AnimitaCard } from '@/components/animita/animita-card'
import { EmptyState } from '@/components/empty-state'
import { DevelopingPhoto } from '@/components/loaders'
import { ComunaFilter } from '@/components/comuna-filter'

// Loose prints with room between them, so each one reads as its own photo on the table.
const GRID = 'grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-8'

export default function ListPage() {
  const { animitas, status } = useAnimitas()

  const sortedSites = useMemo(
    () => [...animitas].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    [animitas]
  )

  return (
    <div className="min-h-svh w-full bg-background pt-20 pb-40">
      <div className="mx-auto space-y-10 px-6 md:px-10">
        <ComunaFilter />
        {status === 'loading' ? (
          <div role="status" className={GRID}>
            <span className="sr-only">Cargando animitas</span>
            {Array.from({ length: 8 }).map((_, i) => <DevelopingPhoto key={i} />)}
          </div>
        ) : sortedSites.length > 0 ? (
          <>
            <p className="sr-only">{sortedSites.length} {sortedSites.length === 1 ? 'animita' : 'animitas'}</p>

            <div className={GRID}>
              {sortedSites.map((site) => <AnimitaCard key={site.id} site={site} />)}
            </div>
          </>
        ) : (
          <EmptyState title="No hay animitas en esas comunas" cutout="nada por acá" description="Prueba con otra comuna o limpia el filtro." />
        )}
        <Button asChild variant="link" className="h-auto p-0 text-xs text-text-weaker">
          <Link href="/creditos">Créditos de las fotos</Link>
        </Button>
      </div>
    </div>
  )
}
