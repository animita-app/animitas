'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAnimitas } from '@/contexts/animitas-context'
import { AnimitaCard } from '@/components/animita/animita-card'
import { EmptyState } from '@/components/empty-state'
import { DevelopingPhoto } from '@/components/loaders'
import { ComunaFilter } from '@/components/comuna-filter'

export default function ListPage() {
  const { animitas, status } = useAnimitas()

  const sortedSites = useMemo(
    () => [...animitas].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    [animitas]
  )

  return (
    <div className="min-h-svh w-full bg-background pt-20 pb-40">
      <div className="px-4 mx-auto space-y-8">
        <ComunaFilter />
        {status === 'loading' ? (
          <div role="status" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            <span className="sr-only">Cargando animitas</span>
            {Array.from({ length: 8 }).map((_, i) => <DevelopingPhoto key={i} />)}
          </div>
        ) : sortedSites.length > 0 ? (
          <>
            <p className="sr-only">{sortedSites.length} {sortedSites.length === 1 ? 'animita' : 'animitas'}</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
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
