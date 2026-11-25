'use client'

import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { AnimitasStatus } from '@/contexts/animitas-context'

interface MapStatusProps {
  status: AnimitasStatus
  count: number
  onRetry: () => void
}

export function MapStatus({ status, count, onRetry }: MapStatusProps) {
  if (status === 'ready' && count > 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center px-4">
      <div
        role={status === 'error' ? 'alert' : 'status'}
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-border-weak bg-background/90 py-1 pl-4 pr-1 shadow-xs backdrop-blur-sm"
      >
        {status === 'loading' && (
          <p className="flex items-center gap-2 py-2 pr-3 text-sm text-text-weak">
            <Spinner />
            Cargando animitas…
          </p>
        )}
        {status === 'error' && (
          <>
            <p className="text-sm text-text-strong">No pudimos cargar las animitas.</p>
            <Button size="sm" variant="secondary" className="rounded-full" onClick={onRetry}>
              <RotateCw />
              Reintentar
            </Button>
          </>
        )}
        {status === 'ready' && count === 0 && (
          <p className="py-2 pr-3 text-sm text-text-strong">Todavía no hay animitas. Agrega la primera.</p>
        )}
      </div>
    </div>
  )
}
